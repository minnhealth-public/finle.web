from functools import wraps
import urllib

from django.core.exceptions import ObjectDoesNotExist, ValidationError
from django.db import transaction
from django.db.models import BooleanField, Case, Count, Exists, F, Max, Min, Prefetch, Q, When
from django.http import HttpResponseForbidden
from django.urls import reverse
from django.utils.http import urlencode

import logging


from .models import CareTeamMember, Clip, ClipUser, GlossaryTerm, Priority, Task, TaskField, TeamTaskField

term_start_delimiter = "{"
term_end_delimiter = "}"

USER_AGENTS = [
    "Magic Browser",
    "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36"
]


def get_clip_queryset(video_id, clip_type):
    # Gets parent of the video clip type
    if video_id is not None and clip_type == "SHORT":
        return Clip.objects.filter(video=video_id, type="MEDIUM")
    elif video_id is not None and clip_type == "MEDIUM":
        return Clip.objects.filter(video=video_id, type="LONG")
    else:
        return Clip.objects.none()


def get_host(request):
    host = request.get_host()
    protocol = "https" if request.is_secure() else "http"
    return f"{protocol}://{host}"


def check_link(url):
    succeded = False
    for user_agent in USER_AGENTS:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': user_agent})
            code = urllib.request.urlopen(req).getcode()
            if code == 200:
                succeded = True
                break

        except urllib.error.HTTPError as error:
            logging.warning(error)
        except urllib.error.URLError as error:
            logging.warning(error)
        except Exception as error:
            logging.warning(error)

    return succeded


# ruff: disable=PLR0913
def reverse_querystring(
    view,
    urlconf=None,
    args=None,
    kwargs=None,
    current_app=None,
    query_kwargs=None,
):
    """Custom reverse to handle query strings.
    Usage:
        reverse('app.views.my_view', kwargs={'pk': 123}, query_kwargs={'search': 'Bob'})
    """
    base_url = reverse(view, urlconf=urlconf, args=args, kwargs=kwargs, current_app=current_app)
    if query_kwargs:
        return f"{base_url}?{urlencode(query_kwargs)}"
    return base_url


def get_child_key_takeaways(clip_id):
    children = Clip.objects.filter(parent=clip_id)
    result = []
    for child in children:
        if child.type == Clip.ClipType.MEDIUM:
            grandchildren = Clip.objects.filter(parent=child.id)

            for grandchild in grandchildren:
                result.extend(grandchild.key_takeaways.all())
        else:
            result.extend(child.key_takeaways.all())
    return result


def get_inputs_and_textareas_elements(tag):
    return (tag.name == "input" and tag["type"] != "radio") or tag.name == "textarea"


# Terms surrounding by curly braces are glossary terms. Replace glossary terms with html tags
def wrap_glossary_term(takeaway_text):
    updated_takeaway = takeaway_text

    if term_start_delimiter in takeaway_text and term_end_delimiter in takeaway_text:
        found_terms = []
        for i, char in enumerate(takeaway_text):
            if char == term_start_delimiter:  # we've hit the start of a term - collect index
                found_terms.append(i + 1)
            if char == term_end_delimiter:  # we've hit the end of a term - collect index
                found_terms.append(i)

        found_terms_index = 0
        while found_terms_index < len(found_terms):
            term = takeaway_text[found_terms[found_terms_index]: found_terms[found_terms_index + 1]]
            try:
                # get the term id and replace the braces with HTML
                term_id = GlossaryTerm.objects.get(term__iexact=term).id

                left_html = "<a href='/glossary?term=%s' class='text-primary_alt hover:text-primary'>" % term_id
                right_html = "</a>"

                term_with_braces = term_start_delimiter + term + term_end_delimiter
                term_with_html = left_html + term + right_html

                updated_takeaway = updated_takeaway.replace(term_with_braces, term_with_html)
            except ObjectDoesNotExist:
                print("%s is not a glossary term." % term)
            finally:
                found_terms_index = found_terms_index + 2  # increment to next pair of indices corresponding to braces

    return updated_takeaway


def replace_term_if_exists(term, text):
    term_index = text.lower().find(term.term.lower())  # finding index to preserve casing
    if term_index > -1:
        term_in_text = text[term_index: term_index + len(term.term)]
        term_with_braces = term_start_delimiter + term_in_text + term_end_delimiter
        return text.replace(term_in_text, term_with_braces)
    return text


def find_and_replace_glossary_terms_in_text(all_glossary_terms, text):
    text = text.replace(term_start_delimiter, "").replace(term_end_delimiter, "")  # remove any existing markup
    for glossary_term in all_glossary_terms:
        text = replace_term_if_exists(glossary_term, text)
    return text


def validate_selection_for_shift_actions(queryset, offset):
    if offset is None:
        raise ValueError("Invalid direction provided.")

    # Ensure all selected tasks have rankings
    if queryset.filter(ranking__isnull=True).exists():
        raise ValidationError(message="Selected tasks must have pre-existing rankings.")

    # Calculate new extremes
    min_value = queryset.aggregate(min_value=Min("ranking__value"))["min_value"] + offset
    max_value = queryset.aggregate(max_value=Max("ranking__value"))["max_value"] + offset

    # Check if rankings are in sequential order
    if max_value - min_value + 1 != queryset.count():
        raise ValidationError(message="Selected tasks must be in sequential order.")

    # Check if the new highest/lowest ranking exists
    new_extreme = max_value if offset == 1 else min_value
    if not Priority.objects.filter(value=new_extreme).exists():
        raise ValidationError(message="Cannot shift rankings as the next ranking doesn't exist.")

    # Return validated min and max values
    return min_value, max_value


def shift_rankings(self, request, queryset, offset):
    min_value, max_value = validate_selection_for_shift_actions(queryset, offset)
    new_extreme = max_value if offset == 1 else min_value

    with transaction.atomic():
        # Reorder queryset depending on which direction we're shifting
        order_by_param = "-ranking__value" if offset == 1 else "ranking__value"
        queryset = queryset.order_by(order_by_param)

        for task in queryset:
            # If new ranking value is the new extreme and is already taken, set that task ranking to None
            new_ranking = Priority.objects.get(value=task.ranking.value + offset)
            if new_ranking.value is new_extreme:
                try:
                    original_min_task = Task.objects.get(ranking=new_ranking)
                    original_min_task.ranking = None
                    original_min_task.save()
                except ObjectDoesNotExist:
                    print("The new ranking value is unassigned")
            # Decrement task ranking value
            task.ranking = new_ranking
            task.save()


# TODO: add in logic to filter out already watched
def get_tasks_by_tags(tags, max_num_tasks=3):
    tag_names = [tag.name for tag in tags]

    # Filter tasks that have any of the given tags
    tasks = Task.objects.filter(related_tags__name__in=tag_names).distinct()

    # Annotate each task with a count of common tags with the given list and get the top
    tasks = tasks.annotate(common_tags_count=Count("related_tags")).order_by("-common_tags_count")
    top_tasks = tasks[:max_num_tasks]
    return top_tasks


def order_by_task_ranking(clips, team_id, max_num_clips=None):
    # Define subquery for checking if a TeamTaskField exists for a TaskField
    team_task_field_exists_subquery = Exists(
        TeamTaskField.objects.filter(task_field_id=F("task_field__id"), team_id=team_id),
    )

    # Query incomplete TeamTaskFields for the given team, ordered by their related Task's ranking
    incomplete_team_task_fields = (
        Task.objects.prefetch_related(
            "related_tags",
        )
        .filter(
            # Filter on if TeamTaskField exists for given team or if there is no related TeamTaskField for TaskField
            team_task_field_exists_subquery
            | Q(taskfield__teamtaskfield__id__isnull=True),
        )
        .filter(
            # Filter out completed fields
            taskfield__teamtaskfield__completed_timestamp__isnull=True,
        )
        .annotate(
            num_task_fields=Count("taskfield"),  # count the number of TaskFields for each Task
        )
        .annotate(
            # Count the number of TeamTaskFields for each TaskField
            num_completed_task_fields=Count("taskfield__teamtaskfield", distinct=True),
        )
        .filter(
            # Filter out Tasks where there are more TaskFields associated than there are completed TeamTaskFields
            Q(num_task_fields__gt=F("num_completed_task_fields")),
        )
        .order_by("-ranking")
    )

    task_tags = set()
    for task in incomplete_team_task_fields:
        task_tags.update(task.related_tags.all())

    ranked_clips = (
        clips.filter(tags__in=task_tags)
        .annotate(
            has_task_tag=Case(When(tags__in=task_tags, then=True), output_field=BooleanField()),
        )
        .annotate(tag_count=Count("tags"))
    )

    unranked_clips = (
        clips.annotate(
            has_task_tag=Case(default_value=False, output_field=BooleanField()),
        )
        .annotate(tag_count=Count("tags"))
        .exclude(id__in=ranked_clips.values_list("id", flat=True))
    )

    clips = ranked_clips.union(unranked_clips).order_by("has_task_tag", "-tag_count")

    if max_num_clips is not None:
        clips.limit(max_num_clips)

    return clips


def get_clips_by_tags(clip_tags, user_id, max_num_clips=6, exclude_clip=None):
    tag_names = [tag.name for tag in clip_tags]

    # Filter clips that have any of the given tags
    clips = (
        Clip.objects.prefetch_related(
            "tags",
            Prefetch("user_info", queryset=ClipUser.objects.filter(user_id=user_id)),
        )
        .annotate(common_tags_count=Count("tags"))
        .order_by("-common_tags_count")
        .exclude(id=exclude_clip)
        .exclude(type__in=[Clip.ClipType.MEDIUM, Clip.ClipType.LONG])
        .filter(tags__name__in=tag_names)
        .distinct()
    )

    # Annotate each clip with a count of common tags with the given list and get the top
    top_clips = clips[:max_num_clips]
    top_clips_list = list(top_clips)

    # If top_clips has less than 6 items, add the top priority videos to fill out the 6
    # TODO: include team task completion in suggestion logic
    total_needed = max_num_clips - len(top_clips)
    if total_needed > 0:
        all_clips = (
            Clip.objects.prefetch_related(
                Prefetch("user_info", queryset=ClipUser.objects.filter(user_id=user_id)),
            )
            .exclude(id=exclude_clip)
            .exclude(type__in=[Clip.ClipType.MEDIUM, Clip.ClipType.LONG])
            .exclude(id__in=top_clips.values_list("id", flat=True))
        )
        all_clips = list(all_clips[:total_needed])
        top_clips_list += all_clips

    return top_clips_list


def parse_radio_elements(radio_elements, task):
    grouped_elements = {}
    for element in radio_elements:
        name = element.get("name")
        if not name:
            continue

        if name in grouped_elements:
            grouped_elements[name].append(element)
        else:
            grouped_elements[name] = [element]

    # Grouped radio elements
    for elements in grouped_elements.values():
        input_elem = elements[0]
        task_field = create_task_field_from_element(input_elem, task)
        # all grouped radio buttons shoud have the same task_field id
        for elem in elements:
            elem["data-task-field-id"] = task_field.id


def parse_input_elements(input_elements, task):
    for input_elem in input_elements:
        task_field = create_task_field_from_element(input_elem, task)
        input_elem["data-task-field-id"] = task_field.id


def parse_select_elements(select_elements, task):
    for select_elem in select_elements:
        task_field = create_task_field_from_element(select_elem, task)
        select_elem["data-task-field-id"] = task_field.id


def create_task_field_from_element(input_elem, task):
    task_fields_dict = {task_field.id: task_field for task_field in task.taskfield_set.all()}
    name = input_elem.get("name")
    input_id = int(input_elem.get("data-task-field-id", -1))
    task_field = task_fields_dict.get(input_id)
    elm_type = input_elem.get("type", input_elem.name)
    required = input_elem.get("data-required") == "true"
    description = input_elem.get("data-description") or ""
    # if the object doesn't exist fill it
    if task_field is None:
        task_field = TaskField(
            label=name,
            type=elm_type,
            required=required,
            description=description,
            task=task,
        )
    else:
        task_field.label = name
        task_field.type = elm_type
        task_field.required = required
        task_field.description = description

    task_field.save()
    return task_field


def user_in_team():
    # there must be a team_id in the route
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):
            if "team_id" not in kwargs:
                return HttpResponseForbidden("No team_id provided")

            member = CareTeamMember.objects.filter(member=request.user, team_id=kwargs["team_id"]).first()
            if not member:
                return HttpResponseForbidden("You do not have permission to access this view.")

            return view_func(request, *args, **kwargs)

        return _wrapped_view

    return decorator

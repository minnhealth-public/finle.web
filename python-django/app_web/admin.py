from bs4 import BeautifulSoup
from django import forms
from django.contrib import admin, messages
from django.core.exceptions import ValidationError
from django.db import transaction
from django.forms import ModelChoiceField
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.html import format_html
from django_object_actions import DjangoObjectActions, action

# This import is required
from .admin_dashboard import ClipReviewRequestModelAdmin  # noqa: F401
from .env import env_get_raw_value
from .models import (
    Channel,
    Clip,
    ClipAddressedTopic,
    ClipReviewRequest,
    FeaturedClip,
    GlossaryRelatedClips,
    GlossaryRelatedTerms,
    GlossaryTerm,
    GlossaryTermReviewRequest,
    KeyTakeaway,
    Partner,
    Priority,
    Resource,
    ResourceReviewRequest,
    Story,
    Tag,
    Task,
    TaskField,
    TaskReviewRequest,
    Topic,
    User,
    Video,
)
from .utils import (
    find_and_replace_glossary_terms_in_text,
    get_clip_queryset,
    get_inputs_and_textareas_elements,
    parse_input_elements,
    parse_radio_elements,
    parse_select_elements,
    shift_rankings,
)

###############################################################################
# TOPIC ADMINISTRATION
###############################################################################

admin.site.register(User)

# class FieldInline(admin.TabularInline):
#     model = Field
#     extra = 0
#     verbose_name = "DATA ENTRY FIELD"
#     verbose_name_plural = "DATA ENTRY FIELDS"


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    fields = ["name", "description", "archived"]
    # inlines = [FieldInline]
    list_display = ["name", "archived"]
    search_fields = ["name", "description"]


###############################################################################
# TAG ADMINISTRATION
###############################################################################


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    fields = ["name", "category"]
    list_display = ["name", "category"]
    search_fields = ["name"]
    list_filter = ["category"]

    actions = ["merge_tags_action"]

    @admin.action(description="Merge Tags")
    def merge_tags_action(self, request, queryset):
        if queryset.count() < 2:
            self.message_user(request, "Select at least two tags to merge.", level="error")
            return None

        # Redirect to the custom form view with selected tags' IDs in query parameters
        selected_ids = ",".join(str(obj.id) for obj in queryset)
        return redirect(reverse("merge_tags_form_view") + f"?selected_ids={selected_ids}")


###############################################################################
# KEY TAKEAWAY ADMINISTRATION
###############################################################################
class ContainsGlossaryTerms(DjangoObjectActions, admin.ModelAdmin):
    @action(label="Identify & Sync Glossary Terms", description="Find and mark up glossary terms")
    def find_terms_for_queryset(self, queryset, getter, setter):
        glossary_terms = GlossaryTerm.objects.all()
        for element in queryset:
            updated_text = find_and_replace_glossary_terms_in_text(glossary_terms, getter(element))
            setter(element, updated_text)
            element.save()

    @action(label="Identify & Sync Glossary Terms", description="Find and mark up glossary terms")
    def find_terms_for_object(self, obj, getter, setter):
        glossary_terms = GlossaryTerm.objects.all()
        updated_text = find_and_replace_glossary_terms_in_text(glossary_terms, getter(obj))
        setter(obj, updated_text)
        obj.save()

    change_actions = ("find_terms_for_object",)
    changelist_actions = ("find_terms_for_queryset",)


@admin.register(KeyTakeaway)
class KeyTakeawayAdmin(ContainsGlossaryTerms):
    @action(label="Identify & Sync Glossary Terms", description="Analyze key takeaways for glossary terms")
    def find_terms_for_takeaways(self, request, queryset):
        super().find_terms_for_queryset(queryset, KeyTakeaway.get_text, KeyTakeaway.set_text)
        messages.success(request, "Done. Successfully identified glossary terms in key takeaways.")

    @action(label="Identify & Sync Glossary Terms", description="Analyze key takeaway for glossary terms")
    def find_terms_for_takeaway(self, request, obj):
        super().find_terms_for_object(obj, KeyTakeaway.get_text, KeyTakeaway.set_text)
        messages.success(request, "Done. Successfully identified glossary terms in key takeaway.")

    change_actions = ("find_terms_for_takeaway",)
    changelist_actions = ("find_terms_for_takeaways",)
    fields = ["text"]
    list_display = ["text"]
    search_fields = ["text"]


###############################################################################
# CHANNEL ADMINISTRATION
###############################################################################


class VideoInline(admin.TabularInline):
    model = Video
    extra = 0
    fields = ["name", "streaming_service", "video_id"]


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    fields = ["name", "description"]
    inlines = [VideoInline]
    search_fields = ["name", "description"]


###############################################################################
# VIDEO ADMINISTRATION
###############################################################################


class ClipInline(admin.TabularInline):
    model = Clip
    extra = 0
    fields = ["name", "type", "parent", "start_time", "end_time", "archived", "play_link"]
    readonly_fields = ["play_link"]
    verbose_name = "VIDEO CLIP"
    verbose_name_plural = "VIDEO CLIPS"

    def __init__(self, parent_model, admin_site):
        super().__init__(parent_model, admin_site)
        self.host = None

    def play_link(self, obj):
        play_url = env_get_raw_value("FRONT_END_HOST") + "/shorts/" + str(obj.id)
        return format_html("<a href='{}' target='_blank'>Play Clip</a>", play_url)


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {"fields": ["name", "description", "archived", "channel"]}),
        ("STREAMING INFORMATION", {"fields": ["streaming_service", "video_id", "url"]}),
        ("ADDITIONAL INFORMATION", {"fields": ["production_year", "quality"]}),
    ]
    inlines = [ClipInline]
    list_display = ["name", "streaming_service", "video_id", "channel"]
    list_filter = ["streaming_service", "channel", "production_year", "quality"]
    search_fields = ["name", "description", "streaming_service", "video_id", "production_year"]

    def get_readonly_fields(self, *_):
        return ["url"]


###############################################################################
# CLIP ADMINISTRATION
###############################################################################


class TopicsAddressedInline(admin.TabularInline):
    model = ClipAddressedTopic
    extra = 0
    verbose_name = "TOPIC ADDRESSED"
    verbose_name_plural = "TOPICS ADDRESSED"


class ClipReviewRequestInline(admin.StackedInline):
    model = ClipReviewRequest
    extra = 0
    verbose_name = "CLIP REVIEW REQUEST"
    verbose_name_plural = "CLIP REVIEW REQUESTS"


class ParentChoiceField(ModelChoiceField):
    def to_python(self, value):
        if value in self.empty_values:
            return None
        try:
            # The commented code is from ModelChoiceField, the base class, in django/forms/models.py. For the
            # parent choice field, it does not work because the corresponding select options are queried in the
            # client based on the selected video and type rather than obtained from the queryset.

            # key = self.to_field_name or "pk"
            # if isinstance(value, self.queryset.model):
            #     value = getattr(value, key)
            # value = self.queryset.get(**{key: value})

            # We can obtain the value by getting it via its primary key from the database. If it does not exist
            # in the database, then an exception will be raised and caught.
            value = Clip.objects.get(pk=value)
        except (ValueError, TypeError, self.queryset.model.DoesNotExist) as exc:
            raise ValidationError(
                self.error_messages["invalid_choice"],
                code="invalid_choice",
                params={"value": value},
            ) from exc
        return value


class ClipForm(forms.ModelForm):
    class Meta:
        model = Clip
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        # set the parent field to our specialized choice field
        # note: the queryset is updated in ClipAdmin.get_form method
        super(ClipForm, self).__init__(*args, **kwargs)
        instance = kwargs.get("instance", None)
        if instance is None:
            self.fields["parent"] = ParentChoiceField(queryset=Clip.objects.none(), required=False)

    endpoint = forms.CharField(widget=forms.HiddenInput())


@admin.register(Clip)
class ClipAdmin(admin.ModelAdmin):
    class Media:
        js = ("admin_clips.js",)

    form = ClipForm
    fieldsets = [
        (None, {"fields": ["name", "video"]}),
        ("VIDEO CLIP INFORMATION",
         {"fields": ["type", "archived", "start_time", "end_time", "parent", "endpoint", "speaker"]}
         ),

        (
            "TAGS",
            {
                "fields": ["tags"],
                "description": "<u>Note:</u> Only enter tags for clips of type SHORT. "
                "Leave blank for clips of type MEDIUM or LONG.",
            },
        ),
        (
            "TAKEAWAYS",
            {
                "fields": ["key_takeaways"],
                "description": "<u>Note:</u> Only enter takeaways for clips of type SHORT. "
                "Leave blank for clips of type MEDIUM or LONG.",
            },
        ),
    ]

    inlines = [TopicsAddressedInline, ClipReviewRequestInline]
    list_display = (
        "name",
        "video",
        "video_clip",
        "type",
        "start_time",
        "end_time",
        "parent",
    )
    list_filter = ["type", "video", "tags"]
    list_per_page = 20
    search_fields = ["name"]
    filter_horizontal = ["key_takeaways", "tags"]

    def __init__(self, model, admin_site):
        super().__init__(model, admin_site)
        self.host = None

    # only allow edits to key_takeaways for clips of type SHORT
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.type and obj.type != "SHORT":
            return ["key_takeaways"]
        else:
            return super(ClipAdmin, self).get_readonly_fields(request, obj)

    # filter the parent's queryset via the video and type fields
    def get_form(self, request, obj=None, **kwargs):
        video_id = obj.video if obj is not None else None
        clip_type = obj.type if obj is not None else None
        form = super(ClipAdmin, self).get_form(request, obj, **kwargs)
        if request.user.has_perm("app_web.change_clip"):
            form.base_fields["parent"].queryset = get_clip_queryset(video_id, clip_type)
        # ToDo: Uncomment get_queryset and replace environment variable w/ host.
        form.base_fields["endpoint"].initial = env_get_raw_value("API_HOST") + reverse("shorts")
        return form

    # cache the host so it can be used elsewhere
    # def get_queryset(self, request):
    #     qs = super(ClipAdmin, self).get_queryset(request)
    #     self.host = get_host(request)
    #     return qs


###############################################################################
# FEATURED CLIP ADMINISTRATION
###############################################################################
@admin.register(FeaturedClip)
class FeaturedClipsAdmin(admin.ModelAdmin):
    fieldsets = [(None, {"fields": ["clip"]})]
    list_display = ["clip"]
    search_fields = ["clip"]
    ordering = ["clip"]

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if obj:
            already_featured = FeaturedClip.objects.exclude(id=obj.id).values_list("clip", flat=True)
        else:
            already_featured = FeaturedClip.objects.values_list("clip", flat=True)
        form.base_fields["clip"].queryset = form.base_fields["clip"].queryset.exclude(id__in=already_featured)
        return form


###############################################################################
# GLOSSARY TERM ADMINISTRATION
###############################################################################


class RelatedTermsInline(admin.TabularInline):
    model = GlossaryRelatedTerms
    extra = 0
    verbose_name = "RELATED TERM"
    verbose_name_plural = "RELATED TERMS"
    fk_name = "related_term"


class RelatedClipsInline(admin.TabularInline):
    model = GlossaryRelatedClips
    extra = 0
    verbose_name = "RELATED CLIP"
    verbose_name_plural = "RELATED CLIPS"


class GlossaryTermReviewRequestInline(admin.StackedInline):
    model = GlossaryTermReviewRequest
    extra = 0
    verbose_name = "GLOSSARY TERM REVIEW REQUEST"
    verbose_name_plural = "GLOSSARY TERM REVIEW REQUESTS"


@admin.register(GlossaryTerm)
class GlossaryAdmin(admin.ModelAdmin):
    fieldsets = [(None, {"fields": ["term", "definition", "source"]})]
    inlines = [RelatedTermsInline, RelatedClipsInline, GlossaryTermReviewRequestInline]
    list_display = ["term"]
    search_fields = ["term"]
    ordering = ["term"]


###############################################################################
# STORY ADMINISTRATION
###############################################################################


@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    fieldsets = [(None, {"fields": ["title", "short_description", "full_story", "video_url"]})]
    list_display = ["title"]
    search_fields = ["title"]
    ordering = ["title"]


###############################################################################
# PARTNER ADMINISTRATION
###############################################################################


@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    fieldsets = [(None, {"fields": ["name", "description", "link", "logo"]})]
    list_display = ["name"]
    search_fields = ["name"]
    ordering = ["name"]


###############################################################################
# RESOURCE ADMINISTRATION
###############################################################################
class ResourceReviewRequestInline(admin.StackedInline):
    model = ResourceReviewRequest
    extra = 0
    verbose_name = "RESOURCE REVIEW REQUEST"
    verbose_name_plural = "RESOURCE REVIEW REQUESTS"


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {"fields": ["title", "description", "link", "file", "type", "is_free", "requires_account"]}),
    ]
    list_display = ["title"]
    search_fields = ["title"]
    ordering = ["title"]
    inlines = [ResourceReviewRequestInline]

    def save_model(self, request, obj, form, change):
        if obj.link and obj.file:
            raise ValidationError("Cannot have both a link and a file.")
        if not obj.link and not obj.file:
            raise ValidationError("Must have either a link or a file.")
        super().save_model(request, obj, form, change)


###############################################################################
# TASK ADMINISTRATION
###############################################################################
class TaskReviewRequestInline(admin.StackedInline):
    model = TaskReviewRequest
    extra = 0
    verbose_name = "TASK REVIEW REQUEST"
    verbose_name_plural = "TASK REVIEW REQUESTS"


@admin.register(TaskField)
class TaskFieldAdmin(admin.ModelAdmin):
    fieldsets = [(None, {"fields": ["label", "description", "required", "type", "task"]})]
    list_display = ["label"]
    search_fields = ["label", "description"]


@admin.register(Task)
class TaskAdmin(ContainsGlossaryTerms):
    @action(label="Identify & Sync Glossary Terms", description="Analyze tasks for glossary terms")
    def find_terms_for_tasks(self, request, queryset):
        super().find_terms_for_queryset(queryset, Task.get_full_description, Task.set_full_description)
        messages.success(request, "Done. Successfully identified glossary terms in tasks.")

    @action(label="Identify & Sync Glossary Terms", description="Analyze task for glossary terms")
    def find_terms_for_task(self, request, obj):
        super().find_terms_for_object(obj, Task.get_full_description, Task.set_full_description)
        messages.success(request, "Done. Successfully identified glossary terms in task.")

    change_actions = ("find_terms_for_task",)
    changelist_actions = ("find_terms_for_tasks",)
    fieldsets = [
        (None, {"fields": ["title", "short_description", "full_description", "topic", "ranking", "is_setup_question"]}),
        ("RELATED OBJECTS", {"fields": ["related_terms", "related_tags", "related_resources"]}),
    ]
    list_display = ["title", "ranking"]
    search_fields = ["title", "short_description", "full_description"]
    filter_horizontal = ["related_terms", "related_tags", "related_resources"]
    actions = ["clear_rankings", "shift_rankings_up", "shift_rankings_down"]
    inlines = [TaskReviewRequestInline]

    @admin.action(description="Clear rankings")
    def clear_rankings(self, _, queryset):
        queryset.update(ranking=None)

    @admin.action(description="Shift rankings up")
    def shift_rankings_up(self, request, queryset):
        offset = 1
        try:
            shift_rankings(self, request, queryset, offset)
            self.message_user(request, "Rankings shifted up successfully.")
        except ValidationError as e:
            error = e.message
            self.message_user(request, error, level="error")

    @admin.action(description="Shift rankings down")
    def shift_rankings_down(self, request, queryset):
        offset = -1
        try:
            shift_rankings(self, request, queryset, offset)
            self.message_user(request, "Rankings shifted down successfully.")
        except ValidationError as e:
            error = e.message
            self.message_user(request, error, level="error")

    def save_model(self, request, obj, form, change):
        # Parse the HTML content

        with transaction.atomic():
            super().save_model(request, obj, form, change)
            soup = BeautifulSoup(obj.full_description, "html.parser")

            input_radios = soup.find_all("input", {"type": "radio"})

            # Extract all input elements
            input_elements = soup.find_all(get_inputs_and_textareas_elements)
            select_elements = soup.find_all("select")

            parse_input_elements(input_elements, obj)
            parse_radio_elements(input_radios, obj)
            parse_select_elements(select_elements, obj)

            # save associations
            obj.full_description = str(soup)
            obj.save()

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        if obj:
            assigned_rankings = set(Task.objects.exclude(id=obj.id).values_list("ranking", flat=True))
        else:
            assigned_rankings = set(Task.objects.values_list("ranking", flat=True))
        form.base_fields["ranking"].queryset = form.base_fields["ranking"].queryset.exclude(id__in=assigned_rankings)
        return form


@admin.register(Priority)
class PriorityAdmin(admin.ModelAdmin):
    fields = ["value"]
    search_fields = ["value"]

    def formfield_for_dbfield(self, db_field, **kwargs):
        formfield = super().formfield_for_dbfield(db_field, **kwargs)

        if db_field.name == "value":

            def validate_priority(value):
                max_priority = Priority.objects.count()
                if value < 1 or value > max_priority + 1:
                    raise ValidationError(f"Priority cannot be greater than {max_priority + 1} or less than 1")

            formfield.validators.append(validate_priority)

        return formfield


###############################################################################
# USER ADMINISTRATION
###############################################################################

# class TopicEngagedInline(admin.TabularInline):
#     model = UserEngagedTopic
#     extra = 0
#     verbose_name = 'TOPIC ENGAGED'
#     verbose_name_plural = 'TOPICS ENGAGED'
#
#
# class ClipWatchedInline(admin.TabularInline):
#     model = UserWatchedClip
#     extra = 0
#     verbose_name = 'CLIP WATCHED'
#     verbose_name_plural = 'CLIPS WATCHED'
#
#
# class FieldCompletedInline(admin.TabularInline):
#     model = UserCompletedField
#     extra = 0
#     verbose_name = 'USER ENTRY FIELD COMPLETED'
#     verbose_name_plural = 'USER ENTRY FIELDS COMPLETED'
#
#
# @admin.register(User)
# class UserAdmin(admin.ModelAdmin):
#     fields = ['name', 'type']
#     inlines = [TopicEngagedInline, ClipWatchedInline, FieldCompletedInline]
#     list_display = ['name', 'type']
#     list_filter = ['type']
#     search_fields = ['name']

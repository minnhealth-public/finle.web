from datetime import datetime, timezone

from django.contrib import messages
from django.contrib.admin.views.decorators import staff_member_required
from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from app_web import utils

from app_web.models import (
    ClipReview,
    ClipReviewRequest,
    GlossaryTermReview,
    GlossaryTermReviewRequest,
    KeyTakeaway,
    Partner,
    Resource,
    ResourceReview,
    ResourceReviewRequest,
    Story,
    Tag,
    TaskReview,
    TaskReviewRequest,
    Topic,
    Video
)
from app_web.serializers import (
    PartnerSerializer,
    ResourceFilterSerializer,
    ResourceSerializer,
    StorySerializer,
    TagSerializer,
    TopicFilterSerializer,
)


@api_view(["GET"])
def get_routes(request):
    routes = [
        {
            "Endpoint": "/api/shorts",
            "method": "GET",
            "body": None,
            "description": "Returns an array of shorts, ordered for the user provided in the headers.",
        },
        {
            "Endpoint": "/api/shorts/{id}/",
            "method": "GET",
            "body": None,
            "description": "Returns the short JSON object with specified id.",
        },
        {
            "Endpoint": "/api/shorts/{id}",
            "method": "PUT",
            "body": {"body": ""},
            "description": "Updates the given short with the details provided in the body, like played or rating.",
        },
        {
            "Endpoint": "/api/glossary/",
            "method": "GET",
            "description": "Returns all the glossary terms.",
        },
        {
            "Endpoint": "/api/glossary/{id}",
            "method": "GET",
            "description": "Returns the glossary term with the specified id.",
        },
        {
            "Endpoint": "/api/stories/",
            "method": "GET",
            "description": "Returns the list of stories that will show on the preauth landing page.",
        },
        {
            "Endpoint": "/api/resources/",
            "method": "GET",
            "description": "Returns the list of resources that will populate the Resources page.",
        },
        # {
        #     'Endpoint': '/api/notes',
        #     'method': 'GET',
        #     'body': None,
        #     'description': 'Returns the list of note objects created by the user.'
        # },
        # {
        #     'Endpoint': '/api/notes',
        #     'method': 'POST',
        #     'body': {
        #         "body": ""
        #     },
        #     'description': 'Creates a new note object'
        # },
    ]

    return Response(routes)


@api_view(["GET"])
def get_stories(request):
    stories = Story.objects.all()
    serializer = StorySerializer(stories, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_partners(request):
    partners = Partner.objects.all()
    serializer = PartnerSerializer(partners, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_tags(request):
    tags = Tag.objects.all()
    serializer = TagSerializer(tags, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_resources(request):
    resources = Resource.objects.prefetch_related(
        "tasks",
        "tasks__topic",
    ).all()
    serializer = ResourceSerializer(resources, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_resource_filters(request):
    # get topics and resources for filter
    topics = Topic.objects.prefetch_related(
        "tasks",
        "tasks__related_tags",
    ).all()
    resources = Resource.objects.all()

    serializer = ResourceFilterSerializer(
        {
            "topics": topics,
            "resource_types": [resource.type for resource in resources],
        },
    )
    return Response(serializer.data)


@staff_member_required
def overview_dashboard(request):
    return render(
        request,
        "admin/app_web/overview_dashboard/index.html",
        {
            "title": "Admin Dashboard"
        }
    )


@staff_member_required
def check_partner_links(request):
    warnings = []
    partners = Partner.objects.all()
    for partner in partners:
        if not utils.check_link(partner.link):
            warnings.append(
                {"model": "partner", "id": partner.id, "url": partner.link})

    return render(
        request,
        "admin/app_web/overview_dashboard/warnings.html",
        {
            "model": "Partner",
            "warnings": warnings
        }
    )


@staff_member_required
def check_resource_links(request):
    warnings = []
    resources = Resource.objects.filter(link__isnull=False).exclude(link='').all()
    for res in resources:
        if not utils.check_link(res.link):
            warnings.append(
                {"model": "resource", "id": res.id, "url": res.link})

    return render(
        request,
        "admin/app_web/overview_dashboard/warnings.html",
        {
            "model": "Resource",
            "warnings": warnings
        }
    )


@staff_member_required
def check_video_links(request):
    warnings = []
    videos = Video.objects.all()
    for video in videos:
        if not utils.check_link(video.url):
            warnings.append(
                {"model": "video", "id": video.id, "url": video.url})
    return render(
        request,
        "admin/app_web/overview_dashboard/warnings.html",
        {
            "model": "Video",
            "warnings": warnings
        }
    )


@staff_member_required
def content_review_dashboard(request):
    context = {
        # Add any variables to use in the template
        "title": "Content Review Dashboard",
        "total_num_clips_need_review": ClipReviewRequest.objects.filter(date_resolved__isnull=True).count(),
        "total_num_tasks_need_review": TaskReviewRequest.objects.filter(date_resolved__isnull=True).count(),
        "total_num_resources_need_review": ResourceReviewRequest.objects.filter(date_resolved__isnull=True).count(),
        "total_num_terms_need_review": GlossaryTermReviewRequest.objects.filter(date_resolved__isnull=True).count(),
    }
    return render(request, "admin/app_web/content_review_dashboard.html", context)


@api_view(["POST"])
def close_reviewrequest(request):
    request_id = request.data.get("request_id")
    model = request.data.get("model")

    review_request_classes = {
        "clip": ClipReviewRequest,
        "task": TaskReviewRequest,
        "resource": ResourceReviewRequest,
        "glossaryterm": GlossaryTermReviewRequest,
    }
    review_request_class = review_request_classes.get(model)

    obj = get_object_or_404(review_request_class, pk=request_id)
    obj.date_resolved = datetime.now(timezone.utc).date()
    obj.save()
    return JsonResponse({"message": "Successfully marked request as closed."})


@api_view(["POST"])
def add_review(request):
    request_id = request.data.get("request_id")
    user_id = request.data.get("user_id")
    model = request.data.get("model")
    note = request.data.get("note")

    review_request_classes = {
        "clip": [ClipReviewRequest, ClipReview],
        "task": [TaskReviewRequest, TaskReview],
        "resource": [ResourceReviewRequest, ResourceReview],
        "glossaryterm": [GlossaryTermReviewRequest, GlossaryTermReview],
    }

    review_request_class = review_request_classes.get(model)[0]
    review_class = review_request_classes.get(model)[1]
    if review_request_class:
        review_request = get_object_or_404(review_request_class, pk=request_id)
        new_review = review_class(
            request=review_request,
            reviewer_id=user_id,
            timestamp=datetime.now(timezone.utc),
            note=note,
        )
        new_review.save()
        return JsonResponse({"message": "Successfully added new review to request."})
    else:
        return JsonResponse({"error": "Invalid model name."}, status=400)


@api_view(["GET"])
def merge_tags_form_view(request):
    selected_ids = request.GET.get("selected_ids", None)
    selected_ids = selected_ids.split(",") if selected_ids is not None else []
    tags_to_merge = Tag.objects.filter(id__in=selected_ids)
    context = {"title": "Merge Tags", "tags_to_merge": tags_to_merge}
    return render(request, "admin/app_web/merge_tag_form.html", context)


@api_view(["POST", "GET"])
def merge_tags_submit(request):
    message = "Successfully merged tags."
    selected = request.data.get("selected")
    not_selected = request.data.get("not_selected")

    # TODO: Add related resources once they are linked
    # TODO: And glossary terms?
    # Add the not_select_tags' related clips and tasks and delete tag
    if selected is not None and not_selected is not None:
        selected_tag = get_object_or_404(Tag, pk=selected)
        for tag_id in not_selected:
            tag_to_delete = get_object_or_404(Tag, pk=tag_id)

            # Migrate clips
            for clip in tag_to_delete.clips.all():
                if not clip.tags.filter(pk=selected_tag.pk).exists():
                    clip.tags.add(selected_tag)
                clip.tags.remove(tag_to_delete)

            # Migrate tasks
            for task in tag_to_delete.tasks.all():
                if not task.related_tags.filter(pk=selected_tag.pk).exists():
                    task.related_tags.add(selected_tag)
                task.related_tags.remove(tag_to_delete)

            tag_to_delete.delete()
        selected_tag.save()
        messages.success(request, message)
    else:
        message = "Error merging tags: selected and/or not_selected were not provided in the POST body"
        messages.error(request, message)
    return JsonResponse({"message": message})


@api_view(["GET"])
def get_filters(request):
    topics = Topic.objects.prefetch_related(
        "tasks",
        "tasks__related_tags",
    ).all()
    serializer = TopicFilterSerializer(topics, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_unused_takeaways(request):
    warnings = []
    takeaways = KeyTakeaway.objects.all()
    for takeaway in takeaways:
        if not len(takeaway.clips.all()) > 0:
            warnings.append(
                {"takeaway_id": takeaway.id, "takeaway_text": takeaway.text})

    return render(
        request,
        "admin/app_web/overview_dashboard/unused_takeaways_warnings.html",
        {
            "warnings": warnings
        }
    )

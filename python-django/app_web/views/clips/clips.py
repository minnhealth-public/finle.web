from datetime import datetime, timezone

from django.contrib.admin.views.decorators import staff_member_required
from django.db import connection
from django.db.models import Prefetch, Q, Count
from django.db.utils import DatabaseError
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from app_web.models import (
    Clip,
    ClipUser,
    FeaturedClip,
    Tag
)
from app_web.utils import get_clips_by_tags, order_by_task_ranking

from .serializer import (
    ClipKeyTakeawaySerializer,
    ClipRatingSerializer,
    ClipSerializer,
    FeaturedClipSerializer,
)
from .service import ClipService


class ShortModelPagination(PageNumberPagination):
    page_size = 12
    page_size_query_param = "page_size"
    max_page_size = 12


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_shorts(request):
    team_id = request.GET.get("team_id", None)
    topics = request.GET.getlist("topics", None)
    tasks = request.GET.getlist("tasks", None)
    query = request.GET.get("query", None)
    played = request.GET.get("played", None)
    unplayed = request.GET.get("unplayed", None)
    saved = request.GET.get("saved", None)
    clip_type = Clip.ClipType(request.GET.get("type", "SHORT"))
    paginate = request.GET.get("paginate", "true").lower()
    video = request.GET.get("video", None)

    shorts = (
        Clip.objects.select_related(
            "video",
            "parent",
        )
        .prefetch_related(
            "parent__tags",
            "parent__parent",
            "parent__parent__tags",
            "tags",
            "key_takeaways",
            "topics_addressed",
            Prefetch("user_info", queryset=ClipUser.objects.filter(user_id=request.user.id)),
        )
        .annotate(topic_count=Count("topics_addressed"))
        .filter(type=clip_type)
        .filter(archived=False)
        .filter(video__archived=False)
        .filter(Q(topics_addressed__archived=False) | Q(topic_count=0))
        .order_by("name")
    )

    if len(topics) > 0:
        shorts = shorts.filter(topics_addressed__id__in=[int(topic) for topic in topics])

    if len(tasks) > 0:
        task_tags = Tag.objects.filter(tasks__id__in=[int(task) for task in tasks]).distinct()
        shorts = shorts.filter(tags__id__in=task_tags)

    if saved is not None:
        shorts = shorts.filter(user_info__saved=True)

    if played is not None:
        shorts = shorts.filter(user_info__watched=True)

    if unplayed is not None:
        shorts = shorts.filter(Q(user_info__watched=False) | Q(user_info=None))

    if query is not None:
        shorts = shorts.filter(name__icontains=query)

    if team_id is not None:
        # Temporary prioritization logic
        shorts = order_by_task_ranking(shorts, team_id)

    if paginate != 'false':
        paginator = ShortModelPagination()
        page = paginator.paginate_queryset(shorts, request)
        if page is not None:
            serializer = ClipSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)

    if video is not None:
        shorts = shorts.filter(video=video)

    serializer = ClipSerializer(shorts, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_short(request, clip_id):
    try:
        clip = (
            Clip.objects
            .annotate(topic_count=Count("topics_addressed"))
            .filter(archived=False)
            .filter(video__archived=False)
            .filter(Q(topics_addressed__archived=False) | Q(topic_count=0))
            .get(id=clip_id)
        )
        serializer = ClipSerializer(clip, many=False)
        return Response(serializer.data)
    except Clip.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_clip_key_takeaways(request, clip_id):
    try:
        # can throw a db error so try and catch it
        rows = ClipService.get_clip_key_takeaways(clip_id)
        serializer = ClipKeyTakeawaySerializer(rows, many=True)
        return Response(serializer.data)
    except ValidationError:
        return Response(message="Incorrect data", status=status.HTTP_400_BAD_REQUEST)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
def put_short(request, clip_id):
    clip = (
        Clip.objects
        .annotate(topic_count=Count("topics_addressed"))
        .filter(archived=False)
        .filter(video__archived=False)
        .filter(Q(topics_addressed__archived=False) | Q(topic_count=0))
        .get(id=clip_id)
    )
    serializer = ClipSerializer(clip, many=False, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


@api_view(["GET"])
def get_related_clips(request, clip_id):
    try:
        clip = (
            Clip.objects.prefetch_related(
                "parent",
                "parent__parent",
                "tags",
                "video"
            )
            .annotate(topic_count=Count("topics_addressed"))
            .filter(archived=False)
            .filter(video__archived=False)
            .filter(Q(topics_addressed__archived=False) | Q(topic_count=0))
            .get(id=clip_id)
        )

        if clip.type == Clip.ClipType.SHORT and (clip.parent is None or clip.parent.parent is None):
            serializer = ClipSerializer(
                get_clips_by_tags(clip.tags.all(), request.user.id, exclude_clip=clip_id),
                many=True,
            )
            return Response(serializer.data)

        return Response([])
    except Clip.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_featured_shorts(request):
    featured_clips = FeaturedClip.objects.prefetch_related("clip").all()
    serializer = FeaturedClipSerializer(featured_clips, many=True)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def put_save_short(request, clip_id):
    user_id = request.user.id
    try:
        clip_user, _ = ClipUser.objects.get_or_create(clip_id=clip_id, user_id=user_id)
        clip_user.saved = True
        clip_user.saved_timestamp = datetime.now(timezone.utc)
        clip_user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def put_unsave_short(request, clip_id):
    user_id = request.user.id
    clip_user, _ = ClipUser.objects.get_or_create(clip_id=clip_id, user_id=user_id)
    clip_user.saved = False
    clip_user.saved_timestamp = None
    clip_user.save()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def put_rating_short(request, clip_id):
    user_id = request.user.id
    try:
        serializer = ClipRatingSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        clip_user, _ = ClipUser.objects.get_or_create(clip_id=clip_id, user_id=user_id)
        clip_user.rating = request.data["rating"]
        clip_user.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    except ValidationError:
        return Response(message="Incorrect data", status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def put_watch_shorts(request):
    user_id = request.user.id
    clip_ids = request.data["clip_ids"]
    if not isinstance(clip_ids, list):
        clip_ids = [clip_ids]

    for clip_id in clip_ids:
        clip_user, _ = ClipUser.objects.get_or_create(clip_id=clip_id, user_id=user_id)
        clip_user.watched = True
        clip_user.watched_timestamp = datetime.now(timezone.utc)
        clip_user.save()

    return Response(status=status.HTTP_204_NO_CONTENT)


@staff_member_required
def check_clip_names(request):
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                cur_clip.id AS cur_clip_id,
                cur_clip.name AS cur_clip_name,
                cur_clip.speaker AS cur_clip_speaker,
                other_clip.id AS other_clip_id
            FROM app_web_clip AS cur_clip
            JOIN app_web_clip AS other_clip
                ON cur_clip.name = other_clip.name
                AND cur_clip.speaker = other_clip.speaker
                AND cur_clip.id < other_clip.id;
            """,
        )

        columns = [col[0] for col in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return render(
            request,
            "admin/app_web/overview_dashboard/clip_match_warnings.html",
            {
                "warnings": rows
            }
        )

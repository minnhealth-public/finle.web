from django.db.models import Prefetch
from django.db.models.functions import Now
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

import logging

from app_web import utils
from app_web.models import (
    CareTeam,
    Task,
    TeamTask,
    TeamTaskField,
    TaskField
)
from app_web.views.clips.serializer import ClipSimpleSerializer

from .serializer import (
    TaskDetailSerializer,
    TaskSerializer,
    TeamTaskFieldPostSerializer,
)
from .utils import get_description_for_team, is_task_complete


logger = logging.getLogger(__name__)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_tasks(request):
    tasks = Task.objects.exclude(topic__archived=True).all()
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@utils.user_in_team()
@permission_classes([IsAuthenticated])
def get_team_tasks(request, team_id: int):
    # ensure the user is part of the team they are trying to modify tasks fields for
    tasks = Task.objects.exclude(topic__archived=True).prefetch_related(
        "ranking",
        "topic",
        Prefetch(
            "teamtask_set",
            queryset=TeamTask.objects.filter(team=team_id),
            to_attr="team_status",
        ),
    ).all()

    # Custom sorting function - first elements are compared, then second elements. Setting second element for completed
    # tasks to very high number to appear at end of sorted list. Tasks without a ranking will appear at the end of the
    # list, above the completed tasks
    def task_sort_key(task_to_sort):
        if task_to_sort.ranking is None:
            return 1, 0
        if task_to_sort.team_status is not None and len(task_to_sort.team_status) > 0:
            return 2, float("inf") - task_to_sort.ranking.value
        else:
            return 0, task_to_sort.ranking.value

    sorted_tasks = sorted(tasks, key=task_sort_key)

    serializer = TaskSerializer(sorted_tasks, many=True)
    return Response(serializer.data)


@api_view(["GET"])
@utils.user_in_team()
@permission_classes([IsAuthenticated])
def get_team_task(request, team_id: int, task_id: int):
    try:
        # ensure the user is part of the team they are trying to modify tasks fields for

        task = Task.objects.prefetch_related(
            "taskfield_set",
            "related_terms",
            "related_tags",
            "related_resources",
            "ranking",
            Prefetch(
                "taskfield_set__teamtaskfield_set",
                queryset=TeamTaskField.objects.filter(team_id=team_id),
                to_attr="teamfield",
            ),
            Prefetch(
                "teamtask_set",
                queryset=TeamTask.objects.filter(team=team_id),
                to_attr="team_status",
            ),
        ).exclude(topic__archived=True).get(pk=task_id)

        task.full_description = get_description_for_team(task)

        serializer = TaskDetailSerializer(task)
        return Response(serializer.data)

    except Task.DoesNotExist as err:
        logger.error(err)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception as err:
        logger.error(err)
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@utils.user_in_team()
@permission_classes([IsAuthenticated])
def get_team_task_clips(request, team_id: int, task_id: int):
    try:
        task = Task.objects.exclude(topic__archived=True).get(pk=task_id)
        clips = utils.get_clips_by_tags(task.related_tags.all(), request.user.id)

        serializer = ClipSimpleSerializer(clips, many=True)
        return Response(serializer.data)
    except Task.DoesNotExist as err:
        logger.error(err)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception as err:
        logger.error(err)
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST", "PATCH"])
@utils.user_in_team()
@permission_classes([IsAuthenticated])
def post_completed_task_fields(request, team_id: int, task_id: int):
    filtered_data = [item for item in request.data if item.get('value') or
                     not TaskField.objects.get(id=item.get('task_field_id')).required]
    empty_items = [item for item in request.data if not item.get('value') and
                   TaskField.objects.get(id=item.get('task_field_id')).required]

    # Delete entry when value is empty
    for item in empty_items:
        existing_task_field = TeamTaskField.objects.filter(
            task_field_id=item.get('task_field_id'),
            user_id=item.get('user_id'),
            team_id=item.get('team_id')
        )
        if existing_task_field.exists():
            existing_task_field.delete()

    # ensure the user is part of the team they are trying to modify tasks fields for
    new_teamtaskfields = TeamTaskFieldPostSerializer(many=True, data=filtered_data)

    try:
        task = Task.objects.prefetch_related(
            Prefetch(
                "taskfield_set__teamtaskfield_set",
                queryset=TeamTaskField.objects.filter(team=team_id),
                to_attr="teamfield",
            ),
            Prefetch(
                "teamtask_set",
                queryset=TeamTask.objects.filter(team=team_id),
                to_attr="team_status",
            ),
        ).get(pk=task_id)

        if new_teamtaskfields.is_valid():
            new_teamtaskfields.save()
            team = CareTeam.objects.get(id=team_id)
            # get or create
            team_task, created = TeamTask.objects.get_or_create(
                task=task,
                team=team,
                defaults={"modified_timestamp": Now()},
            )

            # Update or create TeamTask
            if not created:
                team_task.modified_timestamp = Now()

            if is_task_complete(task):
                team_task.completed_timestamp = Now()
            else:
                team_task.completed_timestamp = None

            team_task.save()
            return Response(new_teamtaskfields.data, status=201)
        return Response(new_teamtaskfields.errors, status=400)

    except Task.DoesNotExist as err:
        logger.error(err)
        return Response(status=status.HTTP_400_BAD_REQUEST)

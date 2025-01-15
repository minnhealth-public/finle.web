from django.db import DatabaseError, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from app_web import utils
from app_web.models import CareTeamMember, Note
from app_web.views.care_teams import CareTeamService
from app_web.views.notes.serializer import NotePostSerializer, NoteSerializer, NoteUpdateSerializer


class NoteModelPagination(PageNumberPagination):
    page_size = 15
    page_size_query_param = "page_size"
    max_page_size = 100


@api_view(["GET"])
@utils.user_in_team()
@permission_classes([IsAuthenticated])
def get_notes(request, team_id: int):
    paginator = NoteModelPagination()
    notes = (
        Note.objects.prefetch_related(
            "video",
            "glossary",
            "clip",
            "clip__video",
            "resource",
            "task",
        )
        .filter(team_id=team_id)
        .order_by("-ctime")
        .all()
    )

    # Check for the optional 'clip' query parameter
    clip_id = request.GET.get('clip')
    if clip_id:
        notes = notes.filter(clip_id=clip_id)

    # Check for the optional 'term' query parameter
    term_id = request.GET.get('term')
    if term_id:
        notes = notes.filter(glossary=term_id)

    # Check for the optional 'task' query parameter
    task_id = request.GET.get('task')
    if task_id:
        notes = notes.filter(task=task_id)

    # Check for the optional 'resource' query parameter
    resource_id = request.GET.get('resource')
    if resource_id:
        notes = notes.filter(resource=resource_id)

    page = paginator.paginate_queryset(notes, request)

    if page is not None:
        serializer = NoteSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)

    serializer = NoteSerializer(notes, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@utils.user_in_team()
@permission_classes([IsAuthenticated])
def post_note(request, team_id: int):
    try:
        # here we increment the notification_count by one for members that are not sending the request

        serializer = NotePostSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            # important to ensure that that if one of the db queries fails that we throw all of the
            # transactions out.
            with transaction.atomic():
                serializer.save()
                CareTeamService.update_team_notifications(team_id, request.user.id)
                return Response(serializer.data, status=status.HTTP_201_CREATED)

    except ValidationError:
        return Response(message="Incorrect data", status=status.HTTP_400_BAD_REQUEST)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@utils.user_in_team()
@permission_classes([IsAuthenticated])
def patch_note(request, team_id: int, note_id: int):
    try:
        serializer = NoteUpdateSerializer(data=request.data)
        note = Note.objects.get(id=note_id)

        if serializer.is_valid(raise_exception=True):
            note.pinned = serializer.data["pinned"]
            note.save()
            return Response(NoteSerializer(note).data)

    except Note.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except CareTeamMember.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except ValidationError:
        return Response(message="Incorrect data", status=status.HTTP_400_BAD_REQUEST)

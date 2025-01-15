from datetime import datetime, timezone

from django.db import DatabaseError, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.serializers import ValidationError

from app_web.models import CareTeam, CareTeamMember, User

from .serializers import (
    CareTeamMemberRemoveSerailizer,
    CareTeamMemberSerializer,
    CareTeamMemberUpdateSerailizer,
    CareTeamPostSerializer,
    CareTeamSerializer,
    CareTeamUpdateSerializer,
)
from .service import CareTeamService


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_care_teams(request):
    """Get all the care teams with the members basic info for the current user."""
    teams = CareTeam.objects.filter(
        team_members=request.user,
        deleted_at__isnull=True,
    ).prefetch_related(
        "members",
        "members__member",
    )
    serializer = CareTeamSerializer(teams, many=True)
    return Response(data=serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_care_team(request, team_id: str):
    """Get all the care teams with the members basic info for the current user."""
    team = CareTeam.objects.get(
        team_members=request.user,
        id=team_id,
        deleted_at__isnull=True,
    ).prefetch_related("members", "members__member")
    serializer = CareTeamSerializer([team], many=True)
    return Response(data=serializer.data[0], status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_care_team(request):
    """Get all the care teams with the members basic info for the current user."""
    team_serial = CareTeamPostSerializer(data=request.data)
    try:
        with transaction.atomic():
            team_serial.is_valid(raise_exception=True)
            team = team_serial.create(validated_data=team_serial.data)

            member_dict = {member["email"]: member for member in request.data["members"]}
            users = {user.email: user for user in User.objects.filter(email__in=member_dict.keys())}

            for email in member_dict:
                member_model = CareTeamMember(
                    team=team,
                    relation=member_dict[email]["relation"],
                    is_careteam_admin=member_dict[email]["is_careteam_admin"],
                )
                # user exists so just use it
                if email in users:
                    member_model.member = users[email]
                else:
                    user = User(email=email)
                    member_model.member = user
                    user.save()
                member_model.save()
            return Response(data=CareTeamSerializer(team).data, status=status.HTTP_200_OK)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_care_team(request, team_id):
    """Update care team. Only allowed for care team admins."""
    try:
        team_serial = CareTeamUpdateSerializer(data=request.data)

        team_serial.is_valid(raise_exception=True)

        member = CareTeamMember.objects.filter(member=request.user, team_id=team_id).prefetch_related("team").first()

        team = member.team

        if not member.is_careteam_admin:
            return Response("You do not have admin rights to edit the care team", status=status.HTTP_403_FORBIDDEN)

        team.name = request.data["name"]
        team.save()

        return Response(data=CareTeamSerializer(member.team).data, status=status.HTTP_200_OK)
    except ValidationError:
        return Response(message="Incorrect data", status=status.HTTP_400_BAD_REQUEST)
    except CareTeam.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_care_team_member(request, team_id: int, member_id: int):
    """Get all the care teams with the members basic info for the current user."""
    team_member_serial = CareTeamMemberRemoveSerailizer(data=request.data)
    try:
        team_member_serial.is_valid(raise_exception=True)
        member = CareTeamMember.objects.filter(member=request.user, team_id=team_id).prefetch_related("team").first()

        remove_member = CareTeamMember.objects.filter(member_id=member_id, team_id=team_id).first()

        if not member.is_careteam_admin:
            return Response("You do not have admin rights to add users", status=status.HTTP_403_FORBIDDEN)
        if request.user.id == member_id:
            return Response("You cannot remove yourself from a clinical team", status=status.HTTP_403_FORBIDDEN)

        remove_member.delete()
        return Response(data=CareTeamSerializer(member.team).data, status=status.HTTP_200_OK)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_care_team(request, team_id: int):
    """Remove care team. Only allowed for care team admins."""
    try:
        team = CareTeam.objects.get(pk=team_id)
        member = CareTeamMember.objects.filter(member=request.user, team_id=team_id).prefetch_related("team").first()
        if not member.is_careteam_admin:
            return Response("You do not have admin rights to add users", status=status.HTTP_403_FORBIDDEN)

        team.deleted_at = datetime.now(timezone.utc)
        team.save()
        return Response(data=CareTeamSerializer(member.team).data, status=status.HTTP_200_OK)
    except CareTeam.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_care_team_member(request, team_id: int, member_id: int):
    """Get all the care teams with the members basic info for the current user."""
    team_member_serial = CareTeamMemberUpdateSerailizer(data=request.data)
    try:
        team_member_serial.is_valid(raise_exception=True)
        member = CareTeamMember.objects.filter(member=request.user, team_id=team_id).prefetch_related("team").first()

        update_member = CareTeamMember.objects.filter(member_id=member_id, team_id=team_id).first()

        if not member.is_careteam_admin:
            return Response("You do not have admin rights to update users", status=status.HTTP_401_UNAUTHORIZED)
        update_member.relation = str(request.data["relation"])
        update_member.is_careteam_admin = request.data["is_careteam_admin"]
        update_member.save()

        return Response(data=CareTeamSerializer(member.team).data, status=status.HTTP_200_OK)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def add_care_team_member(request, team_id: int):
    """Get all the care teams with the members basic info for the current user."""
    team_member_serial = CareTeamMemberSerializer(data=request.data)
    try:
        team_member_serial.is_valid(raise_exception=True)
        added_user = User.objects.filter(email=request.data["email"]).first()

        member = CareTeamMember.objects.filter(member=request.user, team_id=team_id).first()

        if not member or not member.is_careteam_admin:
            return Response("You do not have admin rights to add users", status=status.HTTP_403_FORBIDDEN)

        member_model = CareTeamMember(
            team_id=team_id,
            relation=request.data["relation"],
            is_careteam_admin=request.data["is_careteam_admin"],
            is_caree=request.data["is_caree"],
        )

        # user exists so just use it
        if added_user:
            member_model.member = added_user
        else:
            user = User(email=request.data["email"])
            member_model.member = user
            user.save()
        member_model.save()
        return Response(data=CareTeamSerializer(member.team).data, status=status.HTTP_200_OK)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def add_care_team_notification(request, team_id: int):
    # Keeping this route event though we update it in the notes query in case we have an notification to
    # the team that is done through an action other than add note
    try:
        member = CareTeamMember.objects.filter(member=request.user, team_id=team_id).first()

        if not member:
            return Response("You not part of the requested care team", status=status.HTTP_403_FORBIDDEN)

        # here we increment the notification_count by one for members that are not sending the request
        CareTeamService.update_team_notifications(team_id, request.user.id)

        return Response(status=status.HTTP_201_CREATED)
    except DatabaseError:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def care_team_member_notified(request, team_id: int):
    # Keeping this route event though we update it in the notes query in case we have an notification to
    # the team that is done through an action other than add note
    try:
        member = CareTeamMember.objects.filter(member=request.user, team_id=team_id).first()

        if not member:
            return Response("You not part of the requested care team", status=status.HTTP_403_FORBIDDEN)

        member.notification_count = 0
        member.save()

        # Send updated careteam back for frontend to update careTeams
        team = CareTeam.objects.prefetch_related("members", "members__member").get(
            team_members=request.user,
            id=team_id,
        )

        return Response(data=CareTeamSerializer(team).data, status=status.HTTP_201_CREATED)

    except DatabaseError:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)

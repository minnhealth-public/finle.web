from django.db import DatabaseError, transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from app_web.models import CareTeam, CareTeamMember, User
from app_web.serializers import (
    CareTeamMemberRemoveSerailizer,
    CareTeamMemberSerializer,
    CareTeamMemberUpdateSerailizer,
    CareTeamPostSerializer,
    CareTeamSerializer,
)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_care_teams(request):
    """Get all the care teams with the members basic info for the current user."""
    teams = CareTeam.objects.filter(team_members=request.user).prefetch_related("members")
    serializer = CareTeamSerializer(teams, many=True)
    return Response(data=serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_care_team(request):
    """Get all the care teams with the members basic info for the current user."""
    team_serial = CareTeamPostSerializer(data=request.data)
    try:
        with transaction.atomic():
            if team_serial.is_valid(raise_exception=True):
                team = team_serial.create(validated_data=team_serial.data)

                member_dict = {member["email"]: member for member in request.data["members"]}
                users = {user.email: user for user in User.objects.filter(email__in=member_dict.keys())}

                for email in member_dict:
                    member_model = CareTeamMember(team=team, relation=member_dict[email]["relation"])
                    # user exists so just use it
                    if email in users:
                        member_model.member = users[email]
                    else:
                        user = User(
                            first_name=member_dict[email]["first_name"],
                            last_name=member_dict[email]["last_name"],
                            email=email,
                        )
                        member_model.member = user
                        user.save()
                    member_model.save()
            return Response(data=CareTeamSerializer(team).data, status=status.HTTP_200_OK)
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
        if team_member_serial.is_valid(raise_exception=True):
            member = (
                CareTeamMember.objects.filter(member=request.user, team_id=team_id).prefetch_related("team").first()
            )

            remove_member = CareTeamMember.objects.filter(member_id=member_id, team_id=team_id).first()

            if not member.is_careteam_admin:
                return Response("You do not have admin rights to add users", status=status.HTTP_401_UNAUTHORIZED)
            if request.user.id == member_id:
                return Response("You cannot remove yourself from a clinical team", status=status.HTTP_403_FORBIDDEN)

            remove_member.delete()
        return Response(data=CareTeamSerializer(member.team).data, status=status.HTTP_200_OK)
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
        if team_member_serial.is_valid(raise_exception=True):
            member = (
                CareTeamMember.objects.filter(member=request.user, team_id=team_id).prefetch_related("team").first()
            )

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
        if team_member_serial.is_valid(raise_exception=True):
            added_user = User.objects.filter(email=request.data["email"]).first()

            member = CareTeamMember.objects.filter(member=request.user, team_id=team_id).first()

            if not member.is_careteam_admin:
                return Response("You do not have admin rights to add users", status=status.HTTP_401_UNAUTHORIZED)

            member_model = CareTeamMember(team_id=team_id, relation=request.data["relation"])

            # user exists so just use it
            if added_user:
                member_model.member = added_user
            else:
                user = User(
                    first_name=request.data["first_name"],
                    last_name=request.data["last_name"],
                    email=request.data["email"],
                )
                member_model.member = user
            user.save()
            member_model.save()
        return Response(data=CareTeamMemberSerializer(member_model).data, status=status.HTTP_200_OK)
    except DatabaseError:
        return Response(status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)

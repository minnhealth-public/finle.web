from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from app_web.models import CareTeam, CareTeamMember
from app_web.serializers import CareTeamMemberSerializer

User = get_user_model()


class CareTeamAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="testuser@test.com", password="testpassword")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_care_teams(self):
        response = self.client.get("/api/care-teams")
        assert response.status_code == status.HTTP_200_OK

    def test_create_care_team(self):
        data = {
            "name": "Test Care Team",
            "members": [
                {
                    "first_name": "John",
                    "last_name": "Doe",
                    "email": "john.doe@example.com",
                    "relation": "Family",
                },
                # Add more members as needed
            ],
        }
        response = self.client.post("/api/care-teams/", data, format="json")
        assert response.status_code == status.HTTP_200_OK
        assert CareTeam.objects.count() == 1

    def test_remove_care_team_member_failure_not_admin(self):
        care_team = CareTeam.objects.create(name="Test Care Team")
        member = CareTeamMember.objects.create(member=self.user, team=care_team)
        response = self.client.delete(f"/api/care-teams/{care_team.id}/members/{member.id}/remove")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert CareTeamMember.objects.count() == 1

    def test_remove_care_team_member_remove_self_failure(self):
        care_team = CareTeam.objects.create(name="Test Care Team")
        CareTeamMember.objects.create(member=self.user, team=care_team, is_careteam_admin=True)
        response = self.client.delete(f"/api/care-teams/{care_team.id}/members/{self.user.id}/remove")
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(CareTeamMember.objects.count(), 1)

    def test_remove_care_team_member_remove(self):
        care_team = CareTeam.objects.create(name="Test Care Team")
        user_2 = User.objects.create_user(email="testuser+1@test.com", password="testpassword")
        CareTeamMember.objects.create(member=self.user, team=care_team, is_careteam_admin=True)
        member_2 = CareTeamMember.objects.create(member=user_2, team=care_team)
        member_2.save()

        self.assertEqual(CareTeamMember.objects.count(), 2)
        response = self.client.delete(f"/api/care-teams/{care_team.id}/members/{user_2.id}/remove")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(CareTeamMember.objects.count(), 1)


class CareTeamAddAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="testuser@test.com", password="testpassword")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.care_team = CareTeam.objects.create(name="Test Care Team")
        self.care_team_member = CareTeamMember.objects.create(
            member=self.user,
            team=self.care_team,
            is_careteam_admin=True,
        )

    def test_add_care_team_member_success(self):
        data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "relation": "Family",
        }

        response = self.client.put(f"/api/care-teams/{self.care_team.id}/member", data)
        assert response.status_code == status.HTTP_200_OK

        # Check if the CareTeamMember is created successfully
        member = CareTeamMember.objects.filter(member__email="john@example.com").first()
        assert member is not None

        # Check if the response data matches the serialized CareTeamMember
        serializer = CareTeamMemberSerializer(member)
        assert response.data == serializer.data

    def test_add_care_team_member_unauthorized(self):
        # Test when the user is not an admin of the CareTeam
        self.care_team_member.is_careteam_admin = False
        self.care_team_member.save()
        data = {
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane@example.com",
            "relation": "Friend",
        }

        response = self.client.put(f"/api/care-teams/{self.care_team.id}/member", data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_add_care_team_member_bad_request(self):
        # Test when the request data is invalid
        data = {"invalid_key": "Invalid Value"}

        response = self.client.put(f"/api/care-teams/{self.care_team.id}/member", data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class UpdateCareTeamMemberTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="testuser@test.com", password="testpassword")
        self.client.force_authenticate(user=self.user)

        # Create a CareTeam and CareTeamMember for testing
        self.care_team = CareTeam.objects.create(name="Test Care Team")
        self.care_team_member = CareTeamMember.objects.create(
            member=self.user,
            team=self.care_team,
            is_careteam_admin=True,
        )

    def test_update_care_team_member_success(self):
        data = {
            "relation": "Friend",
            "is_careteam_admin": False,
        }

        response = self.client.patch(f"/api/care-teams/{self.care_team.id}/members/{self.user.id}/update", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the CareTeamMember is updated successfully
        updated_member = CareTeamMember.objects.get(id=self.care_team_member.id)
        assert updated_member.relation == "Friend"
        assert updated_member.is_careteam_admin is False

    def test_update_care_team_member_unauthorized(self):
        # Test when the user is not an admin of the CareTeam
        self.care_team_member.is_careteam_admin = False
        self.care_team_member.save()

        data = {
            "relation": "Family",
            "is_careteam_admin": True,
        }

        response = self.client.patch(f"/api/care-teams/{self.care_team.id}/members/{self.user.id}/update", data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_care_team_member_bad_request(self):
        # Test when the request data is invalid
        data = {"invalid_key": "Invalid Value"}

        response = self.client.patch(f"/api/care-teams/{self.care_team.id}/members/{self.user.id}/update", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from app_web.models import CareTeam, CareTeamMember

from .serializers import CareTeamMemberSerializer

User = get_user_model()


class CareTeamAPIBase(APITestCase):
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
                    "email": "john.doe@example.com",
                    "is_careteam_admin": False,
                    "is_caree": False,
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
        assert response.status_code == status.HTTP_403_FORBIDDEN
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


class CareTeamAddAPITests(CareTeamAPIBase):
    def test_add_care_team_member_success(self):
        data = {
            "email": "john@example.com",
            "is_careteam_admin": False,
            "is_caree": False,
            "relation": "Family",
        }

        response = self.client.put(f"/api/care-teams/{self.care_team.id}/members", data)
        assert response.status_code == status.HTTP_200_OK

        # Check if the CareTeamMember is created successfully
        member = CareTeamMember.objects.filter(member__email="john@example.com").first()
        assert member is not None

        # Check if the response data matches the serialized CareTeam
        serializer = CareTeamMemberSerializer(member)
        assert len(response.data["members"]) == 2
        assert response.data["members"][-1] == serializer.data

    def test_add_care_team_member_unauthorized(self):
        # Test when the user is not an admin of the CareTeam
        self.care_team_member.is_careteam_admin = False
        self.care_team_member.save()
        data = {
            "email": "jane@example.com",
            "relation": "Friend",
        }

        response = self.client.put(f"/api/care-teams/{self.care_team.id}/members", data)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_add_care_team_member_bad_request(self):
        # Test when the request data is invalid
        data = {"invalid_key": "Invalid Value"}

        response = self.client.put(f"/api/care-teams/{self.care_team.id}/members", data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST


class UpdateCareTeam(CareTeamAPIBase):

    def test_update_care_team_success(self):
        data = {
            "name": "new name",
        }

        url = reverse("update careteam", kwargs={"team_id": self.care_team.id})
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        updated_team = CareTeam.objects.get(id=self.care_team.id)
        # Check if the CareTeam is updated successfully
        assert updated_team.name == data["name"]

    def test_update_care_team_no_team(self):
        data = {
            "name": "new name",
        }

        url = reverse("update careteam", kwargs={"team_id": 900})
        response = self.client.patch(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class DeleteCareTeamTestCase(CareTeamAPIBase):

    def test_delete_care_team(self):
        data = {
            "name": "new name",
        }

        url = reverse("remove careteam", kwargs={"team_id": self.care_team.id})
        response = self.client.delete(url, data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class NotificationCareTeamMemberTestCase(CareTeamAPIBase):

    def test_notify_care_team_member_doesnt_notify_user_making_action(self):
        assert self.care_team_member.notification_count == 0

        url = reverse("notify members", kwargs={"team_id": self.care_team.id})
        response = self.client.put(url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        updated_member = CareTeamMember.objects.get(id=self.care_team_member.id)
        assert updated_member.notification_count == 0

    def test_notify_care_team_member(self):

        second_user = User.objects.create_user(email="testuser+1@test.com", password="testpassword")
        care_team_member_2 = CareTeamMember.objects.create(
            member=second_user,
            team=self.care_team,
        )

        assert care_team_member_2.notification_count == 0

        url = reverse("notify members", kwargs={"team_id": self.care_team.id})
        response = self.client.put(url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        updated_member = CareTeamMember.objects.get(id=care_team_member_2.id)
        assert updated_member.notification_count == 1

    def test_notified_care_team_member(self):
        self.care_team_member.notification_count = 5
        self.care_team_member.save()

        member = CareTeamMember.objects.get(id=self.care_team_member.id)
        assert member.notification_count == 5

        url = reverse("notified member", kwargs={"team_id": self.care_team.id})
        response = self.client.put(url)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        updated_member = CareTeamMember.objects.get(id=self.care_team_member.id)
        assert updated_member.notification_count == 0


class UpdateCareTeamMemberTestCase(CareTeamAPIBase):

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

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from app_web.models import CareTeam, CareTeamMember, Note
from app_web.views.notes import NoteSerializer

User = get_user_model()


@pytest.fixture
def create_user():
    return User.objects.create_user(email="testuser@test.com", password="testpassword")


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def create_care_team():
    return CareTeam.objects.create(name="myCare")


@pytest.fixture
def create_care_team_member(create_user, create_care_team):
    return CareTeamMember.objects.create(member=create_user, team=create_care_team)


@pytest.fixture
def create_note(create_user, create_care_team):
    return Note.objects.create(text="This is some description", team=create_care_team, user=create_user)


@pytest.mark.django_db
def test_get_notes(api_client, create_note, create_care_team_member):
    note = create_note
    team_member = create_care_team_member

    # Log in as an authenticated user
    api_client.force_authenticate(user=team_member.member)

    # Make GET request to the endpoint
    url = reverse("get_notes", kwargs={"team_id": team_member.team.id})
    response = api_client.get(url)

    # Assert response status code is 200 OK
    assert response.status_code == status.HTTP_200_OK

    # Deserialize response data
    expected_data = NoteSerializer(instance=[note], many=True).data
    # Assert response data matches expected data
    assert response.data["results"] == expected_data


@pytest.mark.django_db
def test_get_notes_unauthenticated(api_client, create_note, create_care_team, create_user):
    # Log in as an authenticated user
    api_client.force_authenticate(user=create_user)

    # Make GET request to the endpoint
    url = reverse("get_notes", kwargs={"team_id": create_care_team.id})
    response = api_client.get(url)

    # Assert response status code is 403 not in team OK
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_post_note(api_client, create_user, create_care_team_member):
    # Log in as an authenticated user
    team: CareTeam = create_care_team_member.team
    api_client.force_authenticate(user=create_user)
    request_data = {"user_id": create_user.id, "team_id": team.id, "text": "First note test"}

    # Test POST request
    response = api_client.post(f"/api/care-teams/{team.id}/notes/create", request_data, format="json")

    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_patch_note(api_client, create_user, create_care_team_member, create_note):
    # Log in as an authenticated user
    team: CareTeam = create_care_team_member.team
    api_client.force_authenticate(user=create_user)

    assert create_note.pinned is False

    request_data = {
        "id": create_note.id,
        "user_id": create_user.id,
        "team_id": team.id,
        "text": "First note test",
        "pinned": True,
    }

    # Test POST request
    response = api_client.patch(f"/api/care-teams/{team.id}/notes/{create_note.id}", request_data, format="json")

    assert response.status_code == status.HTTP_200_OK

    # ensure the value is updated
    assert Note.objects.get(id=create_note.id).pinned is True

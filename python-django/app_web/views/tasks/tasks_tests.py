import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient

from app_web.models import CareTeam, CareTeamMember, Task, TaskField, TeamTaskField, Topic
from .serializer import TaskSerializer

User = get_user_model()


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
def create_team_task_field(create_user, create_task_field, create_care_team):
    return TeamTaskField.objects.create(
        value="Test Field",
        task_field=create_task_field,
        team=create_care_team,
        user=create_user,
    )


@pytest.fixture
def create_task_field(create_task):
    return TaskField.objects.create(
        task=create_task,
        label="input",
        required=True,
        type="TEXTAREA",
        description="text input",
    )


@pytest.fixture
def create_task():
    topic = Topic.objects.create(
        name="General",
        description="This is a general topic",
    )
    return Task.objects.create(
        title="Test Task",
        short_description="Short description",
        full_description="Full description",
        topic=topic,
    )


@pytest.fixture
def create_user():
    return User.objects.create_user(email="testuser@test.com", password="testpassword")


@pytest.mark.django_db
def test_get_tasks(api_client, create_task, create_user):
    # Create a task
    task = create_task

    # Log in as an authenticated user
    api_client.force_authenticate(user=create_user)

    # Make GET request to the endpoint
    url = reverse("get_tasks")
    response = api_client.get(url)

    # Assert response status code is 200 OK
    assert response.status_code == status.HTTP_200_OK

    # Deserialize response data
    expected_data = TaskSerializer(instance=[task], many=True).data

    # Assert response data matches expected data
    assert response.data == expected_data


@pytest.mark.django_db
def test_get_completed_task_fields_for_team(
    api_client,
    create_user,
    create_care_team_member,
    create_team_task_field,
    create_care_team,
):
    # Log in as an authenticated user
    api_client.force_authenticate(user=create_user)

    # Make GET request to the endpoint
    url = reverse("get_team_tasks", kwargs={"team_id": create_care_team.id})
    response = api_client.get(url)

    # Assert response status code is 200 OK
    assert response.status_code == status.HTTP_200_OK

    # Deserialize response data
    expected_data = TaskSerializer(instance=[create_team_task_field.task_field.task], many=True).data
    # Assert response data matches expected data
    assert response.data == expected_data


@pytest.mark.django_db
def test_get_completed_task_fields_for_team_no_permission(api_client, create_user, create_care_team):
    # Log in as an authenticated user
    api_client.force_authenticate(user=create_user)

    # Make GET request to the endpoint without creating CareTeamMember
    url = reverse("get_team_tasks", kwargs={"team_id": create_care_team.id})
    response = api_client.get(url)

    # Assert response status code is 403 Forbidden
    assert response.status_code == status.HTTP_403_FORBIDDEN


@pytest.mark.django_db
def test_post_completed_task_fields(
    api_client,
    create_user,
    create_care_team,
    create_care_team_member,
    create_task_field,
):
    # Log in as an authenticated user
    api_client.force_authenticate(user=create_user)
    request_data = [
        {
            "user_id": create_user.id,
            "team_id": create_care_team.id,
            "task_field_id": create_task_field.id,
            "value": "Value 1",
        },
    ]

    # Test POST request
    response = api_client.post(
        f"/api/care-teams/{create_care_team.id}/tasks/{create_task_field.task.id}/fields/",
        request_data,
        format="json",
    )
    assert response.status_code == status.HTTP_201_CREATED


@pytest.mark.django_db
def test_post_completed_task_fields_wo_permissions(api_client, create_user, create_care_team, create_task_field):
    # Log in as an authenticated user
    api_client.force_authenticate(user=create_user)
    request_data = [
        {
            "user_id": create_user.id,
            "team_id": create_care_team.id,
            "task_field_id": create_task_field.id,
            "value": "Value 1",
        },
    ]

    # Test POST request
    response = api_client.post(
        f"/api/care-teams/{create_care_team.id}/tasks/{create_task_field.task.id}/fields/",
        request_data,
        format="json",
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

    # Test PATCH request
    response = api_client.patch(
        f"/api/care-teams/{create_care_team.id}/tasks/{create_task_field.task.id}/fields/",
        request_data,
        format="json",
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN

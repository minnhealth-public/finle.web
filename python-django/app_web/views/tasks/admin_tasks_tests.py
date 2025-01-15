from unittest.mock import MagicMock

import pytest
from django.contrib.admin.sites import AdminSite
from django.contrib.messages import get_messages
from django.contrib.messages.middleware import MessageMiddleware
from django.contrib.messages.storage.fallback import FallbackStorage
from django.contrib.sessions.middleware import SessionMiddleware
from django.test import RequestFactory

from app_web.admin import TaskAdmin
from app_web.models import GlossaryTerm, Task, TaskField, Topic, User


@pytest.fixture
def admin_site():
    return AdminSite()


@pytest.fixture
def task_admin():
    return TaskAdmin(admin_site=admin_site, model=Task)


@pytest.fixture
def user():
    return User.objects.create_user(email="testuser@test.com", password="testpassword")


@pytest.fixture
def request_factory():
    return RequestFactory()


@pytest.fixture
def tasks():
    """Add a set of to do tasks to the database, one for each task field type"""
    task_list = []
    for _, task_field_type in enumerate(TaskField.TaskFieldType):
        test_topic = Topic.objects.create(name="Legal", description="Test", archived=False)
        task_obj = Task.objects.create(
            title=f"{task_field_type.title()} Task",
            short_description="Short description",
            full_description="Full description test with glossary term",
            topic=test_topic,
        )
        task_list.append(task_obj)

    return task_list


@pytest.fixture(autouse=True)
def mock_glossary_terms():
    mock_terms = [
        GlossaryTerm.objects.create(term="Term", definition="Test definition", source="https://test.com"),
    ]
    mock_queryset = MagicMock()
    mock_queryset.all.return_value = mock_terms
    return mock_queryset


@pytest.mark.django_db
class TestTaskContainsGlossaryTerms:
    def test_find_terms_for_queryset(self, task_admin, user, request_factory, tasks):
        request = request_factory.get("/admin/app_web/task/")
        request.user = user

        # Initialize session middleware
        session_middleware = SessionMiddleware(get_response=lambda _: None)
        session_middleware.process_request(request)

        # Initialize message middleware and storage
        middleware = MessageMiddleware(get_response=lambda _: None)
        middleware.process_request(request)
        request._messages = FallbackStorage(request)  # noqa: SLF001

        task_admin.find_terms_for_tasks(request, tasks)

        storage = get_messages(request)
        messages = [message.message for message in storage]
        assert "Done. Successfully identified glossary terms in tasks." in messages
        for task in tasks:
            assert "{term}" in task.full_description

    def test_find_terms_for_object(self, task_admin, user, request_factory, tasks):
        obj = tasks[0]
        original_description = obj.full_description

        request = request_factory.get(f"/admin/app_web/task/{obj.id}/change")
        request.user = user

        # Initialize session middleware
        session_middleware = SessionMiddleware(get_response=lambda _: None)
        session_middleware.process_request(request)

        # Initialize message middleware and storage
        middleware = MessageMiddleware(get_response=lambda _: None)
        middleware.process_request(request)
        request._messages = FallbackStorage(request)  # noqa: SLF001

        task_admin.find_terms_for_task(request, obj)

        # Add assertions to check if glossary terms were properly replaced in the object's description
        updated_description = obj.full_description
        assert original_description != updated_description
        assert "{term}" not in original_description and "{term}" in updated_description

        storage = get_messages(request)
        messages = [message.message for message in storage]
        assert "Done. Successfully identified glossary terms in task." in messages

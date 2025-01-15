import pytest

from app_web import models


@pytest.fixture(autouse=True)
def tasks():
    """Add a set of to do tasks to the database, one for each task field type"""
    task_list = []
    for _, task_field_type in enumerate(models.TaskField.TaskFieldType):
        task_field_list = []
        test_topic = models.Topic.objects.create(name="Legal", description="Test")
        task_obj = models.Task.objects.create(
            title=f"{task_field_type.title()} Task",
            short_description="Test",
            full_description="Full Test",
            topic=test_topic,
        )

        task_field_obj = models.TaskField.objects.create(
            label=f"{task_field_type.title()} Field Type",
            description="Test Description",
            required=False,
            type=task_field_type,
            task=task_obj,
        )
        task_field_list.append(task_field_obj)
        task_list.append(task_obj)

    return task_list

    # Tear down


class TestTasks:
    @pytest.mark.django_db()
    def test_tasks(self, tasks):
        assert isinstance(tasks[0], models.Task)
        assert len(tasks) == len(models.TaskField.TaskFieldType)

from django.utils import timezone
from rest_framework.serializers import (
    IntegerField,
    ModelSerializer,
    SerializerMethodField,
    SlugRelatedField,
)

from app_web.models import (
    Clip,
    Task,
    TaskField,
    TeamTask,
    TeamTaskField,
)
from app_web.serializers import (
    GlossaryTermSerializer,
    ResourceSerializer,
    TagSerializer,
    TopicSerializer,
)
from app_web.utils import wrap_glossary_term


class RelatedClipSerializerForTask(ModelSerializer):
    video = SlugRelatedField(many=False, read_only=True, slug_field="video_id")
    end_time = SerializerMethodField()
    start_time = SerializerMethodField()
    video_url = SerializerMethodField()

    class Meta:
        model = Clip
        fields = (
            "id",
            "type",
            "name",
            "video",
            "start_time",
            "end_time",
            "video_url",
        )

    @staticmethod
    def get_end_time(obj):
        return int(obj.end_time.total_seconds())

    @staticmethod
    def get_start_time(obj):
        return int(obj.start_time.total_seconds())

    @staticmethod
    def get_video_url(obj):
        return obj.video.url

    @staticmethod
    def get_played(obj):
        return obj.video.played


class TaskFieldSerializer(ModelSerializer):
    team_task_fields = SerializerMethodField()

    class Meta:
        model = TaskField
        fields = "__all__"
        extra_fields = ["team_task_fields"]

    @staticmethod
    def get_team_task_fields(obj):
        return TeamTaskFieldSerializer(obj.teamtaskfield_set.all(), many=True).data


class TaskSerializer(ModelSerializer):
    topic = TopicSerializer(many=False)
    full_description = SerializerMethodField()
    status = SerializerMethodField()
    ranking = SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "short_description",
            "full_description",
            "topic",
            "ranking",
            "status",
        ]

    @staticmethod
    def get_full_description(obj):
        return wrap_glossary_term(obj.full_description)

    @staticmethod
    def get_ranking(obj):
        if obj.ranking:
            return obj.ranking.value
        else:
            return None

    @staticmethod
    def get_status(obj):
        """Only return completed if the object has the prefetched value."""
        if not hasattr(obj, "team_status"):
            return None
        elif len(obj.team_status) > 0:
            return TeamTaskSerializer(obj.team_status[-1]).data
        else:
            return None


class TaskDetailSerializer(ModelSerializer):
    related_terms = GlossaryTermSerializer(many=True)
    related_tags = TagSerializer(many=True)
    related_resources = ResourceSerializer(many=True)
    topic = TopicSerializer(many=False)
    task_fields = SerializerMethodField()
    full_description = SerializerMethodField()
    status = SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "short_description",
            "full_description",
            "topic",
            "related_terms",
            "related_tags",
            "related_resources",
            "task_fields",
            "ranking",
            "status",
        ]

    @staticmethod
    def get_task_fields(obj):
        return TaskFieldSerializer(obj.taskfield_set.all(), many=True).data

    @staticmethod
    def get_full_description(obj):
        return wrap_glossary_term(obj.full_description)

    @staticmethod
    def get_status(obj):
        """Only return completed if the object has the prefetched value."""
        if not hasattr(obj, "team_status"):
            return None
        elif len(obj.team_status) > 0:
            return TeamTaskSerializer(obj.team_status[-1]).data
        else:
            return None


class TeamTaskSerializer(ModelSerializer):
    class Meta:
        model = TeamTask
        fields = [
            "modified_timestamp",
            "completed_timestamp",
        ]


class TeamTaskFieldSerializer(ModelSerializer):
    team_id = IntegerField()
    user_id = IntegerField()
    task_field_id = IntegerField()

    class Meta:
        model = TeamTaskField
        fields = [
            "id",
            "value",
            "completed_timestamp",
            "team_id",
            "user_id",
            "task_field_id",
        ]

    def get_team_id(self, obj):
        return obj.team.id

    def get_user_id(self, obj):
        return obj.user.id

    def get_task_field_id(self, obj):
        return obj.task_field.id


class TeamTaskFieldPostSerializer(ModelSerializer):
    team_id = IntegerField()
    user_id = IntegerField()
    task_field_id = IntegerField()

    class Meta:
        model = TeamTaskField
        fields = [
            "team_id",
            "user_id",
            "task_field_id",
            "value",
        ]

    def create(self, validated_data):
        tt_field, _ = TeamTaskField.objects.update_or_create(
            task_field_id=validated_data.get("task_field_id", None),
            team_id=validated_data.get("team_id", None),
            user_id=validated_data.get("user_id", None),
            defaults={
                "value": validated_data.get("value", ""),
                "completed_timestamp": timezone.now(),
            },
        )
        return tt_field

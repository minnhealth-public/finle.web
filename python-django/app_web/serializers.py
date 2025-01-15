from django.contrib.auth import get_user_model
from rest_framework.serializers import (
    IntegerField,
    ModelSerializer,
    Serializer,
    SerializerMethodField,
)
from .env import env_get_raw_value

from app_web.models import (
    Clip,
    GlossaryTerm,
    KeyTakeaway,
    Partner,
    Resource,
    Story,
    Tag,
    Task,
    Topic,
)
from app_web.utils import wrap_glossary_term

UserModel = get_user_model()


class KeyTakeawaySerializer(ModelSerializer):
    text = SerializerMethodField()

    class Meta:
        model = KeyTakeaway
        fields = ("id", "text")

    @staticmethod
    def get_text(obj):
        return wrap_glossary_term(obj.text)


class TopicSerializer(ModelSerializer):
    class Meta:
        model = Topic
        fields = ("id", "name")


class StorySerializer(ModelSerializer):
    class Meta:
        model = Story
        fields = "__all__"


class PartnerSerializer(ModelSerializer):
    class Meta:
        model = Partner
        fields = "__all__"


class TaskSimpleSerializer(ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "ranking",
        ]


class TagSerializer(ModelSerializer):
    category = SerializerMethodField()

    class Meta:
        model = Tag
        fields = "__all__"

    @staticmethod
    def get_category(obj):
        return TopicSerializer(obj.category, many=False).data


class ResourceSerializer(ModelSerializer):
    topics = SerializerMethodField()
    tasks = SerializerMethodField()
    link = SerializerMethodField()

    class Meta:
        model = Resource
        fields = "__all__"

    @staticmethod
    def get_topics(obj):
        return TopicSerializer([task.topic for task in obj.tasks.all()], many=True).data

    @staticmethod
    def get_tasks(obj):
        return ResourceTaskSerializer(obj.tasks.all(), many=True).data

    @staticmethod
    def get_link(obj):
        if obj.file:
            return env_get_raw_value("API_HOST") + obj.file.url
        return obj.link


class ResourceTaskSerializer(ModelSerializer):

    class Meta:
        model = Task
        fields = ["id", "title"]


class TopicFilterSerializer(ModelSerializer):
    tasks = SerializerMethodField()

    class Meta:
        model = Topic
        fields = ["id", "name", "tasks"]

    @staticmethod
    def get_tasks(obj):
        return TaskFilterSerializer(obj.tasks, many=True).data


class ResourceFilterSerializer(Serializer):
    topics = SerializerMethodField()
    resource_types = SerializerMethodField()

    @staticmethod
    def get_topics(obj):
        return TopicFilterSerializer(obj["topics"], many=True).data

    @staticmethod
    def get_resource_types(obj):
        return set(obj["resource_types"])


class TaskFilterSerializer(ModelSerializer):
    tags = SerializerMethodField()

    class Meta:
        model = Task
        fields = ["id", "title", "tags"]

    @staticmethod
    def get_tags(task_obj):
        return TagFilterSerializer(task_obj.related_tags, many=True).data


class TagFilterSerializer(ModelSerializer):
    topic_id = IntegerField(source="category_id")

    class Meta:
        model = Tag
        fields = ["id", "name", "topic_id"]


class RelatedGlossaryTermSerializer(ModelSerializer):
    class Meta:
        model = GlossaryTerm
        fields = ("id", "term")


class RelatedClipsSerializer(ModelSerializer):
    class Meta:
        model = Clip
        fields = ("id", "name")


class GlossaryTermSerializer(ModelSerializer):
    related_terms = SerializerMethodField()
    related_clips = SerializerMethodField()

    class Meta:
        model = GlossaryTerm
        fields = (
            "id",
            "term",
            "definition",
            "source",
            "related_terms",
            "related_clips",
        )

    @staticmethod
    def get_related_terms(obj):
        return RelatedGlossaryTermSerializer(obj.related_terms, many=True).data

    @staticmethod
    def get_related_clips(obj):
        return RelatedClipsSerializer(obj.related_clips, many=True).data

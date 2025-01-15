from rest_framework.serializers import BooleanField, IntegerField, ModelSerializer, Serializer, SerializerMethodField

from app_web.models import GlossaryTerm, Note, Resource, Task
from app_web.views.clips.serializer import ClipSimpleSerializer


class NoteUpdateSerializer(Serializer):
    pinned = BooleanField(required=True)


class NotePostSerializer(ModelSerializer):
    user_id = IntegerField()
    team_id = IntegerField()
    clip_id = IntegerField(required=False)
    glossary_id = IntegerField(required=False)
    resource_id = IntegerField(required=False)
    task_id = IntegerField(required=False)

    class Meta:
        model = Note
        fields = [
            "text",
            "team_id",
            "user_id",
            "clip_id",
            "glossary_id",
            "resource_id",
            "task_id",
        ]

    def get_team_id(self, obj):
        return obj.team_id

    def get_user_id(self, obj):
        return obj.user_id

    def get_clip_id(self, obj):
        return obj.clip_id

    def get_glossary_id(self, obj):
        return obj.glossary_id

    def get_resource_id(self, obj):
        return obj.resource_id

    def get_task_id(self, obj):
        return obj.task_id


class NoteSerializer(ModelSerializer):
    user_id = IntegerField()
    team_id = IntegerField()
    glossary = SerializerMethodField()
    clip = SerializerMethodField()
    resource = SerializerMethodField()
    task = SerializerMethodField()

    class Meta:
        model = Note
        fields = [
            "id",
            "text",
            "pinned",
            "ctime",
            "user_id",
            "team_id",
            "clip",
            "task",
            "glossary",
            "resource",
        ]

    def get_team_id(self, obj):
        return obj.team_id

    def get_user_id(self, obj):
        return obj.user_id

    def get_glossary(self, obj):
        if obj.glossary:
            return GlossaryTermSerializer(obj.glossary).data

    def get_clip(self, obj):
        if obj.clip:
            return ClipSimpleSerializer(obj.clip).data

    def get_resource(self, obj):
        if obj.resource:
            return ResourceSerializer(obj.resource).data

    def get_task(self, obj):
        if obj.task:
            return TodoSerializer(obj.task).data


class GlossaryTermSerializer(ModelSerializer):

    class Meta:
        model = GlossaryTerm
        fields = (
            "id",
            "term",
            "definition",
            "source",
        )


class ResourceSerializer(ModelSerializer):
    class Meta:
        model = Resource
        fields = "__all__"


class TodoSerializer(ModelSerializer):
    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "short_description",
        )

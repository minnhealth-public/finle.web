from django.db.models import IntegerField
from rest_framework.response import Serializer
from rest_framework.serializers import (
    ModelSerializer,
    SerializerMethodField,
    SlugRelatedField,
)

from app_web.models import Clip, ClipUser, FeaturedClip
from app_web.serializers import TaskSimpleSerializer
from app_web.utils import get_tasks_by_tags


class ClipKeyTakeawaySerializer(Serializer):
    id = SerializerMethodField()
    clip_id = SerializerMethodField()
    clip_name = SerializerMethodField()
    text = SerializerMethodField()
    start_time = SerializerMethodField()
    end_time = SerializerMethodField()

    class Meta:
        field = ("id", "clip_id", "clip_name", "text", "start_time", "end_time")

    @staticmethod
    def get_id(obj):
        return obj["id"]

    @staticmethod
    def get_clip_id(obj):
        return obj["clip_id"]

    @staticmethod
    def get_clip_name(obj):
        return obj["clip_name"]

    @staticmethod
    def get_text(obj):
        return obj["text"]

    @staticmethod
    def get_end_time(obj):
        return int(obj["end_time"].total_seconds())

    @staticmethod
    def get_start_time(obj):
        return int(obj["start_time"].total_seconds())


class RelatedClipSerializer(ModelSerializer):
    video = SlugRelatedField(many=False, read_only=True, slug_field="video_id")
    end_time = SerializerMethodField()
    start_time = SerializerMethodField()
    video_url = SerializerMethodField()
    tasks = SerializerMethodField()

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
            "tasks",
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
    def get_tasks(obj):
        return TaskSimpleSerializer(get_tasks_by_tags(obj.tags.all()), many=True).data


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


class ClipSimpleSerializer(ModelSerializer):
    video = SerializerMethodField()
    video_url = SerializerMethodField()
    end_time = SerializerMethodField()
    start_time = SerializerMethodField()

    class Meta:
        model = Clip
        fields = (
            "id",
            "name",
            "type",
            "video",
            "start_time",
            "end_time",
            "video_url",
        )

    @staticmethod
    def get_video_url(obj):
        return obj.video.url

    @staticmethod
    def get_end_time(obj):
        return int(obj.end_time.total_seconds())

    @staticmethod
    def get_start_time(obj):
        return int(obj.start_time.total_seconds())

    @staticmethod
    def get_video(obj):
        return obj.video.video_id


class ClipSerializer(ModelSerializer):
    video = SlugRelatedField(many=False, read_only=True, slug_field="video_id")
    end_time = SerializerMethodField()
    start_time = SerializerMethodField()
    longer_clip = SerializerMethodField()
    entire_clip = SerializerMethodField()
    video_url = SerializerMethodField()
    tasks = SerializerMethodField()
    saved = SerializerMethodField()
    watched = SerializerMethodField()
    rating = SerializerMethodField()
    name = SerializerMethodField()
    watched_timestamp = SerializerMethodField()

    class Meta:
        model = Clip
        fields = (
            "id",
            "name",
            "type",
            "video",
            "start_time",
            "end_time",
            "topics_addressed",
            "longer_clip",
            "entire_clip",
            "video_url",
            "tags",
            "tasks",
            "saved",
            "watched",
            "rating",
            "speaker",
            "watched_timestamp"
        )

    @staticmethod
    def get_name(obj):
        if obj.speaker:
            return f"{obj.name} [{obj.speaker}]"
        return obj.name

    @staticmethod
    def get_end_time(obj):
        return int(obj.end_time.total_seconds())

    @staticmethod
    def get_start_time(obj):
        return int(obj.start_time.total_seconds())

    @staticmethod
    def get_longer_clip(obj):
        if obj.parent is not None and obj.parent.type == Clip.ClipType.MEDIUM:
            return RelatedClipSerializer(obj.parent, many=False).data
        return None

    @staticmethod
    def get_entire_clip(obj):
        if obj.parent is not None:
            if obj.parent.type == Clip.ClipType.LONG:
                return RelatedClipSerializer(obj.parent, many=False).data
            if obj.parent.type == Clip.ClipType.MEDIUM and obj.parent.parent is not None:
                return RelatedClipSerializer(obj.parent.parent, many=False).data
        return None

    @staticmethod
    def get_video_url(obj):
        return obj.video.url

    @staticmethod
    def get_tasks(obj):
        return TaskSimpleSerializer(get_tasks_by_tags(obj.tags.all()), many=True).data

    @staticmethod
    def get_saved(obj):
        try:
            if len(obj.user_info.all()) == 0:
                raise ClipUser.DoesNotExist
            clip_user = obj.user_info.all()[0]
            return clip_user.saved
        except ClipUser.DoesNotExist:
            return False

    @staticmethod
    def get_watched(obj):
        try:
            if len(obj.user_info.all()) == 0:
                raise ClipUser.DoesNotExist

            clip_user = obj.user_info.all()[0]
            return clip_user.watched
        except ClipUser.DoesNotExist:
            return False

    @staticmethod
    def get_watched_timestamp(obj):
        try:
            if len(obj.user_info.all()) == 0:
                raise ClipUser.DoesNotExist

            clip_user = obj.user_info.all()[0]
            return clip_user.watched_timestamp
        except ClipUser.DoesNotExist:
            return False

    @staticmethod
    def get_rating(obj):
        try:
            if len(obj.user_info.all()) == 0:
                raise ClipUser.DoesNotExist

            clip_user = obj.user_info.all()[0]
            return clip_user.rating
        except ClipUser.DoesNotExist:
            return None


class FeaturedClipSerializer(ModelSerializer):
    clip = ClipSimpleSerializer()

    class Meta:
        model = FeaturedClip
        fields = "__all__"

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation["clip"]  # Return only the clip objects without the FeaturedClip field keys


class ClipRatingSerializer(Serializer):
    rating = IntegerField()


class ClipParentSerializer(ModelSerializer):
    class Meta:
        model = Clip
        fields = ("id", "name")

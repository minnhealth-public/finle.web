from rest_framework.serializers import (
    ModelSerializer,
    SerializerMethodField,
)

from app_web.models import Clip, GlossaryTerm


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

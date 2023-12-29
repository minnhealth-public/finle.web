from django import forms
from django.contrib import admin
from django.core.exceptions import ValidationError
from django.forms import ModelChoiceField
from django.urls import reverse

from .env import env_get_raw_value
from .models import (
    Channel,
    Clip,
    ClipAddressedTopic,
    ClipReviewRequest,
    Field,
    GlossaryRelatedClips,
    GlossaryRelatedTerms,
    GlossaryTerm,
    Partner,
    Story,
    Tag,
    Topic,
    Video,
)
from .utils import get_clip_queryset

###############################################################################
# TOPIC ADMINISTRATION
###############################################################################


class FieldInline(admin.TabularInline):
    model = Field
    extra = 0
    verbose_name = "DATA ENTRY FIELD"
    verbose_name_plural = "DATA ENTRY FIELDS"


@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    fields = ["name", "description"]
    inlines = [FieldInline]
    list_display = ["name"]
    search_fields = ["name", "description"]


###############################################################################
# TAG ADMINISTRATION
###############################################################################


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    fields = ["name", "category"]
    list_display = ["name", "category"]
    search_fields = ["name"]
    list_filter = ["category"]


###############################################################################
# CHANNEL ADMINISTRATION
###############################################################################


class VideoInline(admin.TabularInline):
    model = Video
    extra = 0
    fields = ["name", "streaming_service", "video_id"]


@admin.register(Channel)
class ChannelAdmin(admin.ModelAdmin):
    fields = ["name", "description"]
    inlines = [VideoInline]
    search_fields = ["name", "description"]


###############################################################################
# VIDEO ADMINISTRATION
###############################################################################


class ClipInline(admin.TabularInline):
    model = Clip
    extra = 0
    fields = ["name", "parent", "start_time", "end_time"]
    verbose_name = "VIDEO CLIP"
    verbose_name_plural = "VIDEO CLIPS"


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    fieldsets = [
        (None, {"fields": ["name", "description", "channel"]}),
        ("STREAMING INFORMATION", {"fields": ["streaming_service", "video_id"]}),
    ]
    inlines = [ClipInline]
    list_display = ["name", "streaming_service", "video_id", "channel"]
    list_filter = ["streaming_service", "channel"]
    search_fields = ["name", "description", "streaming_service", "video_id"]


###############################################################################
# CLIP ADMINISTRATION
###############################################################################


class TopicsAddressedInline(admin.TabularInline):
    model = ClipAddressedTopic
    extra = 0
    verbose_name = "TOPIC ADDRESSED"
    verbose_name_plural = "TOPICS ADDRESSED"


class TagInline(admin.TabularInline):
    model = Tag.clips.through
    extra = 0
    verbose_name = "TAG"
    verbose_name_plural = "TAGS"


class ClipReviewRequestInline(admin.StackedInline):
    model = ClipReviewRequest
    extra = 0
    verbose_name = "CLIP REVIEW REQUEST"
    verbose_name_plural = "CLIP REVIEW REQUESTS"


class ParentChoiceField(ModelChoiceField):
    def to_python(self, value):
        if value in self.empty_values:
            return None
        try:
            # The commented code is from ModelChoiceField, the base class, in django/forms/models.py. For the
            # parent choice field, it does not work because the corresponding select options are queried in the
            # client based on the selected video and type rather than obtained from the queryset.

            # key = self.to_field_name or "pk"
            # if isinstance(value, self.queryset.model):
            #     value = getattr(value, key)
            # value = self.queryset.get(**{key: value})

            # We can obtain the value by getting it via its primary key from the database. If it does not exist
            # in the database, then an exception will be raised and caught.
            value = Clip.objects.get(pk=value)
        except (ValueError, TypeError, self.queryset.model.DoesNotExist) as exc:
            raise ValidationError(
                self.error_messages["invalid_choice"],
                code="invalid_choice",
                params={"value": value},
            ) from exc
        return value


class ClipForm(forms.ModelForm):
    class Meta:
        model = Clip
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        # set the parent field to our specialized choice field
        # note: the queryset is updated in ClipAdmin.get_form method
        super(ClipForm, self).__init__(*args, **kwargs)
        instance = kwargs.get("instance", None)
        if instance is None:
            self.fields["parent"] = ParentChoiceField(queryset=Clip.objects.none(), required=False)

    endpoint = forms.CharField(widget=forms.HiddenInput())


@admin.register(Clip)
class ClipAdmin(admin.ModelAdmin):
    class Media:
        js = ("admin_clips.js",)

    form = ClipForm

    fieldsets = [
        (None, {"fields": ["name", "description", "video"]}),
        (
            "VIDEO CLIP INFORMATION",
            {"fields": ["type", "start_time", "end_time", "parent", "endpoint"]},
        ),
    ]

    inlines = [TopicsAddressedInline, TagInline, ClipReviewRequestInline]
    list_display = ["name", "video", "type", "start_time", "end_time", "parent"]
    list_filter = ["type", "video", "tags"]
    search_fields = ["name", "description"]

    # filter the parent's queryset via the video and type fields
    def get_form(self, request, obj=None, **kwargs):
        video_id = obj.video if obj is not None else None
        clip_type = obj.type if obj is not None else None
        form = super(ClipAdmin, self).get_form(request, obj, **kwargs)
        form.base_fields["parent"].queryset = get_clip_queryset(video_id, clip_type)
        form.base_fields["endpoint"].initial = env_get_raw_value("API_HOST") + reverse("get_clips")
        return form


###############################################################################
# GLOSSARY TERM ADMINISTRATION
###############################################################################


class RelatedTermsInline(admin.TabularInline):
    model = GlossaryRelatedTerms
    extra = 0
    verbose_name = "RELATED TERM"
    verbose_name_plural = "RELATED TERMS"
    fk_name = "related_term"


class RelatedClipsInline(admin.TabularInline):
    model = GlossaryRelatedClips
    extra = 0
    verbose_name = "RELATED CLIP"
    verbose_name_plural = "RELATED CLIPS"


@admin.register(GlossaryTerm)
class GlossaryAdmin(admin.ModelAdmin):
    fieldsets = [(None, {"fields": ["term", "definition", "source"]})]
    inlines = [RelatedTermsInline, RelatedClipsInline]
    list_display = ["term"]
    search_fields = ["term"]
    ordering = ["term"]


###############################################################################
# STORY ADMINISTRATION
###############################################################################
@admin.register(Story)
class StoryAdmin(admin.ModelAdmin):
    fieldsets = [(None, {"fields": ["title", "short_description", "full_story", "video_url"]})]
    list_display = ["title"]
    search_fields = ["title"]
    ordering = ["title"]


###############################################################################
# PARTNER ADMINISTRATION
###############################################################################
@admin.register(Partner)
class PartnerAdmin(admin.ModelAdmin):
    fieldsets = [(None, {"fields": ["name", "description", "link", "logo"]})]
    list_display = ["name"]
    search_fields = ["name"]
    ordering = ["name"]


###############################################################################
# USER ADMINISTRATION
###############################################################################

# class TopicEngagedInline(admin.TabularInline):
#     model = UserEngagedTopic
#     extra = 0
#     verbose_name = 'TOPIC ENGAGED'
#     verbose_name_plural = 'TOPICS ENGAGED'
#
#
# class ClipWatchedInline(admin.TabularInline):
#     model = UserWatchedClip
#     extra = 0
#     verbose_name = 'CLIP WATCHED'
#     verbose_name_plural = 'CLIPS WATCHED'
#
#
# class FieldCompletedInline(admin.TabularInline):
#     model = UserCompletedField
#     extra = 0
#     verbose_name = 'USER ENTRY FIELD COMPLETED'
#     verbose_name_plural = 'USER ENTRY FIELDS COMPLETED'
#
#
# @admin.register(User)
# class UserAdmin(admin.ModelAdmin):
#     fields = ['name', 'type']
#     inlines = [TopicEngagedInline, ClipWatchedInline, FieldCompletedInline]
#     list_display = ['name', 'type']
#     list_filter = ['type']
#     search_fields = ['name']

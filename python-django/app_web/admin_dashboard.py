from django.contrib import admin
from django.shortcuts import get_object_or_404

from .env import env_get_raw_value
from .models import (
    ClipReview,
    ClipReviewRequest,
    GlossaryTermReview,
    GlossaryTermReviewRequest,
    ResourceReview,
    ResourceReviewRequest,
    TaskField,
    TaskReview,
    TaskReviewRequest,
)


class CustomFilter(admin.SimpleListFilter):
    title = "Filter"  # Displayed on the right
    parameter_name = "filter"  # URL parameter name

    def lookups(self, _, __):
        # Return a list of tuples: (lookup_value, human-readable representation)
        return (
            ("needs_review", "Open (Needs review)"),
            ("closed", "Closed"),
        )

    def queryset(self, _, queryset):
        # Filter queryset based on the selected value
        if self.value() == "needs_review":
            return queryset.filter(date_resolved__isnull=True)
        if self.value() == "closed":
            return queryset.filter(date_resolved__isnull=False)


class BaseReviewRequestAdmin(admin.ModelAdmin):
    model = None
    change_list_template = None
    change_form_template = None

    @staticmethod
    def review_requested_date(obj):
        return f"{obj.date_issued}"

    @staticmethod
    def status(obj):
        if obj.date_resolved:
            return "Closed"
        else:
            return "Open"

    def get_list_filter(self, _):
        return (CustomFilter,)

    # hides the '<Model> review requests' section on the sidebar
    def has_module_permission(self, _):
        return False

    # hides the Add button on the changelist view
    def has_add_permission(self, _):
        return False

    # Customizes the action dropdown/removes the default actions (ie, Delete)
    def get_actions(self, request):
        actions = super().get_actions(request)
        actions.clear()
        return actions


@admin.register(ClipReviewRequest)
class ClipReviewRequestModelAdmin(BaseReviewRequestAdmin):
    model = ClipReviewRequest
    change_list_template = "admin/app_web/content_review_changelist.html"
    change_form_template = "admin/app_web/content_review_clip.html"

    @staticmethod
    def clip_name(obj):
        return f"{obj.clip.name}"

    @staticmethod
    def clip_type(obj):
        return f"{obj.clip.type}"

    def get_list_display(self, _):
        return ["clip_name", "clip_type", "review_requested_date", "status"]

    def changelist_view(self, request, extra_context=None):
        extra_context = {
            "total_num_need_review": self.model.objects.filter(date_resolved__isnull=True).count(),
            "model_name_plural": "clips",
        }
        return super().changelist_view(request, extra_context=extra_context)

    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        if object_id:
            obj = get_object_or_404(ClipReviewRequest, pk=object_id)
            if obj.clip.parent:
                parent_link = env_get_raw_value("FRONT_END_HOST") + "/videos/" + str(obj.clip.parent.id)
            else:
                parent_link = ""
            extra_context = {
                "obj": obj,
                "link": env_get_raw_value("FRONT_END_HOST") + "/videos/" + str(obj.clip.id),
                "past_reviews": ClipReview.objects.filter(request_id=obj.id).order_by("-timestamp"),
                "clip_duration": obj.clip.end_time - obj.clip.start_time,
                "parent_link": parent_link,
            }

        return super().changeform_view(request, object_id, form_url, extra_context)


@admin.register(TaskReviewRequest)
class TaskReviewRequestModelAdmin(BaseReviewRequestAdmin):
    model = TaskReviewRequest
    change_list_template = "admin/app_web/content_review_changelist.html"
    change_form_template = "admin/app_web/content_review_task.html"

    @staticmethod
    def task_name(obj):
        return f"{obj.task.title}"

    @staticmethod
    def task_topic(obj):
        return f"{obj.task.topic}"

    @staticmethod
    def task_ranking(obj):
        return f"{obj.task.ranking}"

    def get_list_display(self, _):
        return ["task_name", "task_ranking", "task_topic", "review_requested_date", "status"]

    def changelist_view(self, request, extra_context=None):
        extra_context = {
            "total_num_need_review": self.model.objects.filter(date_resolved__isnull=True).count(),
            "model_name_plural": "tasks",
        }
        return super().changelist_view(request, extra_context=extra_context)

    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        if object_id:
            obj = get_object_or_404(TaskReviewRequest, pk=object_id)
            extra_context = {
                "obj": obj,
                "past_reviews": TaskReview.objects.filter(request_id=obj.id).order_by("-timestamp"),
                "num_required_fields": TaskField.objects.filter(task_id=obj.task.id).count(),
            }

        return super().changeform_view(request, object_id, form_url, extra_context)


@admin.register(ResourceReviewRequest)
class ResourceReviewRequestModelAdmin(BaseReviewRequestAdmin):
    model = ResourceReviewRequest
    change_list_template = "admin/app_web/content_review_changelist.html"
    change_form_template = "admin/app_web/content_review_resource.html"

    @staticmethod
    def resource_name(obj):
        return f"{obj.resource.title}"

    @staticmethod
    def resource_type(obj):
        return f"{obj.resource.type}"

    def get_list_display(self, _):
        return ["resource_name", "resource_type", "review_requested_date", "status"]

    def changelist_view(self, request, extra_context=None):
        extra_context = {
            "total_num_need_review": self.model.objects.filter(date_resolved__isnull=True).count(),
            "model_name_plural": "resources",
        }
        return super().changelist_view(request, extra_context=extra_context)

    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        if object_id:
            obj = get_object_or_404(ResourceReviewRequest, pk=object_id)
            extra_context = {
                "obj": obj,
                "past_reviews": ResourceReview.objects.filter(request_id=obj.id).order_by("-timestamp"),
            }

        return super().changeform_view(request, object_id, form_url, extra_context)


@admin.register(GlossaryTermReviewRequest)
class GlossaryTermReviewRequestModelAdmin(BaseReviewRequestAdmin):
    model = GlossaryTermReview
    change_list_template = "admin/app_web/content_review_changelist.html"
    change_form_template = "admin/app_web/content_review_glossaryterm.html"

    @staticmethod
    def term_name(obj):
        return f"{obj.term.term}"

    def get_list_display(self, _):
        return ["term_name", "review_requested_date", "status"]

    def changelist_view(self, request, extra_context=None):
        extra_context = {
            "total_num_need_review": self.model.objects.filter(date_resolved__isnull=True).count(),
            "model_name_plural": "glossary terms",
        }
        return super().changelist_view(request, extra_context=extra_context)

    def changeform_view(self, request, object_id=None, form_url="", extra_context=None):
        if object_id:
            obj = get_object_or_404(GlossaryTermReviewRequest, pk=object_id)
            extra_context = {
                "obj": obj,
                "past_reviews": GlossaryTermReview.objects.filter(request_id=obj.id).order_by("-timestamp"),
            }

        return super().changeform_view(request, object_id, form_url, extra_context)

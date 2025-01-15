"""URL configuration for finle.app_web project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/

Examples
--------
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))

"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import TokenVerifyView

from app_web import views
from app_web.sentry import divide_by_zero_endpoint
from app_web.views import auth, care_teams, clips, curator_audit, glossary_terms, notes, tasks
from allauth.headless.base import views as headless_views
from allauth.headless.socialaccount import views as socialaccount_views

CLIENT = "browser"

# Note: The video curator-audit report requires an admin login, but because it has an /admin prefix in the URI
# the entry needs to come before Django `admin/` entry or the admin parser will be called to handle the
# curator-audit request.
# FMI: https://stackoverflow.com/questions/10053981/how-can-i-create-custom-page-for-django-admin

urlpatterns = [
    path("admin/overview-dashboard/", views.overview_dashboard, name="overview_dashboard"),
    path("admin/content-review-dashboard/", views.content_review_dashboard, name="content_review_dashboard"),

    path(
        "admin/content-review-dashboard/close/",
        views.close_reviewrequest,
        name="close_reviewrequest",
    ),
    path("admin/content-review-dashboard/add-review/", views.add_review, name="add_review"),
    path("admin/merge-tags/", views.merge_tags_form_view, name="merge_tags_form_view"),
    path("admin/merge-tags/submit/", views.merge_tags_submit, name="merge_tags_submit"),
    path("admin/curator-audit", curator_audit.get_audit_report, name="curator_audit"),
    path("admin/curator-audit/compare", curator_audit.compare_audit_reports, name="compare_audit_reports"),
    path("admin/curator-audit/merge/", curator_audit.audit_merge, name="audit_merge"),
    path("admin/curator-audit/backup", curator_audit.backup_to_excel, name="backup_to_excel"),
    path("admin/", admin.site.urls),
    path("api/", views.get_routes, name="routes"),
    path("api/videos/check-links/", views.check_video_links, name="check_video_links"),
    path("api/shorts/", clips.get_shorts, name="shorts"),
    path("api/shorts/<int:clip_id>/", clips.get_short, name="get_short"),
    path(
        "api/shorts/<int:clip_id>/key_takeaways/",
        clips.get_clip_key_takeaways,
        name="get_short_takeaways",
    ),
    path("api/shorts/<int:clip_id>", clips.put_short, name="put_short"),
    path("api/shorts/featured", clips.get_featured_shorts, name="get_featured_shorts"),
    path("api/shorts/check-duplicate-names/", clips.check_clip_names, name="get_matching_names"),
    path("api/shorts/<int:clip_id>/related", clips.get_related_clips, name="get_related_shorts"),
    path("api/shorts/<int:clip_id>/save", clips.put_save_short, name="put_save_short"),
    path("api/shorts/<int:clip_id>/unsave", clips.put_unsave_short, name="put_unsave_short"),
    path("api/shorts/<int:clip_id>/rating", clips.put_rating_short, name="put_rating_short"),
    path("api/shorts/watch", clips.put_watch_shorts, name="put_watch_shorts"),
    path("api/filters/", views.get_filters, name="get_filters"),
    path("api/tags/", views.get_tags, name="get_tags"),
    path("api/glossary/", glossary_terms.get_glossary_terms, name="get_glossary_terms"),
    path("api/glossary/check-links/", glossary_terms.get_check_links, name="check_glossary_links"),
    path("api/glossary/<int:term_id>/", glossary_terms.get_glossary_term, name="get_glossary_term"),
    path("api/stories/", views.get_stories, name="get_stories"),
    path("api/partners/", views.get_partners, name="get_partners"),
    path("api/partners/check-links/", views.check_partner_links, name="check_partner_links"),
    path("api/resources/", views.get_resources, name="get_resources"),
    path("api/resources/check-links/", views.check_resource_links, name="check_resource_links"),
    path("api/resources/filters", views.get_resource_filters, name="get_resource_filters"),
    path("api/tasks/", tasks.get_tasks, name="get_tasks"),
    path("api/takeaways/unused/", views.get_unused_takeaways, name="get_unused_takeaways"),
    path(
        "api/care-teams/<int:team_id>/tasks/",
        tasks.get_team_tasks,
        name="get_team_tasks",
    ),
    path(
        "api/care-teams/<int:team_id>/tasks/<int:task_id>/",
        tasks.get_team_task,
        name="get_team_task",
    ),
    path(
        "api/care-teams/<int:team_id>/tasks/<int:task_id>/fields/",
        tasks.post_completed_task_fields,
        name="post_completed_task_fields",
    ),
    path(
        "api/care-teams/<int:team_id>/tasks/<int:task_id>/clips",
        tasks.get_team_task_clips,
        name="get_team_task_clips",
    ),
    path("api/care-teams", care_teams.get_care_teams, name="care_teams"),
    path("api/care-teams/<int:team_id>/notes", notes.get_notes, name="get_notes"),
    path("api/care-teams/<int:team_id>/delete", care_teams.remove_care_team, name="remove careteam"),
    path("api/care-teams/<int:team_id>/update", care_teams.update_care_team, name="update careteam"),
    path("api/care-teams/<int:team_id>/notes/create", notes.post_note, name="create_note"),
    path("api/care-teams/<int:team_id>/notes/<int:note_id>", notes.patch_note, name="update_note"),
    path("api/care-teams/<int:team_id>", care_teams.get_care_team, name="care_team"),
    path("api/care-teams/", care_teams.create_care_team, name="create_care_teams"),
    path(
        "api/care-teams/<int:team_id>/members",
        care_teams.add_care_team_member,
        name="add_careteam_member",
    ),
    path(
        "api/care-teams/<int:team_id>/members/notified",
        care_teams.care_team_member_notified,
        name="notified member",
    ),
    path(
        "api/care-teams/<int:team_id>/members/notify",
        care_teams.add_care_team_notification,
        name="notify members",
    ),
    path(
        "api/care-teams/<int:team_id>/members/<int:member_id>/remove",
        care_teams.remove_care_team_member,
        name="remove_careteam_member",
    ),
    path(
        "api/care-teams/<int:team_id>/members/<int:member_id>/update",
        care_teams.update_care_team_member,
        name="update_careteam_member",
    ),
    path("api/auth/logout", auth.logout, name="logout_user"),
    path("api/auth/social/accounts/", include("allauth.urls")),
    path("api/auth/social/config", headless_views.ConfigView.as_api_view(client=CLIENT), name="social_config"),
    path(
        "api/auth/social/provider/redirect",
        socialaccount_views.RedirectToProviderView.as_api_view(client=CLIENT),
        name="social_config"
    ),
    path("api/auth/change-password", auth.change_password, name="update_password"),
    path("api/auth/user", auth.update_user, name="update_user"),
    path("api/auth/get_user_token", auth.get_token_for_auth, name="get_token"),
    path("api/auth/register", auth.create_account, name="register"),
    path("api/auth/token/share", auth.login_with_share_token, name="login with shared token"),
    path("api/auth/token/share/", auth.create_share_token, name="create share token"),
    path("api/auth/token/", auth.ObtainToken.as_view(), name="token_obtain_pair"),
    path("api/auth/recover-account/", auth.recover_account, name="recover account"),
    path("api/auth/recover-account/reset", auth.recover_reset, name="recover account"),
    path("api/auth/token/verify", TokenVerifyView.as_view(), name="token_verify"),
    path("api/auth/token/refresh/", auth.refresh_token, name="token_refresh"),
    path("sentry-test/<int:test_val>", divide_by_zero_endpoint, name="sentry-test"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = "FinLe Admin Portal"
admin.site.site_title = "Authoring Tool"
admin.site.index_title = "Site Administration"

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

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
from django.urls import path
from rest_framework_simplejwt.views import TokenVerifyView

from app_web import views
from app_web.sentry import divide_by_zero_endpoint
from app_web.views import auth, care_teams

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", views.get_routes, name="routes"),
    path("api/shorts/", views.get_shorts, name="shorts"),
    path("api/shorts/<int:clip_id>/", views.get_short, name="get_short"),
    path("api/shorts/<int:clip_id>", views.put_short, name="put_short"),
    path("api/clips/", views.get_clips, name="get_clips"),
    path("api/glossary/", views.get_glossary_terms, name="get_glossary_terms"),
    path("api/glossary/<int:term_id>/", views.get_glossary_term, name="get_glossary_term"),
    path("api/stories/", views.get_stories, name="get_stories"),
    path("api/partners/", views.get_partners, name="get_partners"),
    path("api/care-teams", care_teams.get_care_teams, name="care_teams"),
    path("api/care-teams/", care_teams.create_care_team, name="create_care_teams"),
    path(
        "api/care-teams/<int:team_id>/member",
        care_teams.add_care_team_member,
        name="add_careteam_member",
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
    path("api/auth/register", auth.create_account, name="register"),
    path("api/auth/token/", auth.ObtainToken.as_view(), name="token_obtain_pair"),
    path("api/auth/token/verify", TokenVerifyView.as_view(), name="token_verify"),
    path("api/auth/token/refresh/", auth.refresh_token, name="token_refresh"),
    path("sentry-test/<int:test_val>", divide_by_zero_endpoint, name="sentry-test"),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

admin.site.site_header = "Financial and Legal Tools Portal"
admin.site.site_title = "Authoring Tool"
admin.site.index_title = "Site Administration"

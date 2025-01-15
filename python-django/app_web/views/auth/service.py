from django.conf import settings

from rest_framework.response import Response
from rest_framework import status

from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from .serializers import FinleTokenObtainPairSerializer
from app_web import models


class AuthService:

    @classmethod
    def generate_auth_response(cls, user: models.User):
        refresh = FinleTokenObtainPairSerializer.get_token(user)
        data = {
            "access": str(refresh.access_token),
        }
        resp = Response(data, status=status.HTTP_201_CREATED)
        # Set the cookie so that we can use refresh without storing data in localstorage
        cls.set_auth_cookie(resp, str(refresh))
        return resp

    @classmethod
    def set_auth_cookie(cls, resp: Response, refresh: str):
        resp.set_cookie(
            key=settings.SIMPLE_JWT["REFRESH_COOKIE"],
            httponly=settings.SIMPLE_JWT["REFRESH_COOKIE_HTTP_ONLY"],
            secure=settings.SIMPLE_JWT["REFRESH_COOKIE_SECURE"],
            samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
            value=str(refresh),
        )


class FinleSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        user = sociallogin.user
        members = models.CareTeamMember.objects.filter(
            member=user.id,
            team__deleted_at__isnull=True
        ).all()

        if members:
            return

        try:
            # if there is no team for user create one for the user
            team = models.CareTeam(name="Care Team")
            member_model = models.CareTeamMember(
                team=team,
                member=user,
                is_careteam_admin=True,
            )
            team.save()
            member_model.save()
        except Exception:
            pass

from app_web.views.auth.service import AuthService
from app_web import models
from rest_framework import status
from django.test import TestCase


class TestAuthService(TestCase):

    def test_set_auth_cookie(self):
        self.user = models.User.objects.create_user(
            email="testuser@test.com", password="testpassword"
        )
        resp = AuthService.generate_auth_response(self.user)
        assert resp.status_code == status.HTTP_201_CREATED

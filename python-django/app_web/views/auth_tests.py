from http.cookies import SimpleCookie

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class CreateAccountTestCase(APITestCase):
    def test_create_account_success(self):
        data = {
            "email": "test@example.com",
            "password": "testpassword",
        }

        response = self.client.post("/api/auth/register", data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if the response contains the access token
        self.assertIn("access", response.data)

        # Check if the refresh token cookie is set
        self.assertIn(settings.SIMPLE_JWT["REFRESH_COOKIE"], response.cookies)

    def test_create_account_invalid_data(self):
        # Test when the request data is invalid
        data = {"invalid_key": "Invalid Value"}

        response = self.client.post("/api/auth/register", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_account_existing_email(self):
        # Test when trying to create an account with an existing email
        existing_user = {
            "email": "existing@example.com",
            "password": "existingpassword",
        }

        self.client.post("/api/auth/register", existing_user)

        duplicate_user = {
            "email": "existing@example.com",
            "password": "newpassword",
        }

        response = self.client.post("/api/auth/register", duplicate_user)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)


class ObtainTokenTestCase(APITestCase):
    def test_obtain_token_success(self):
        # Test obtaining a token successfully
        data = {
            "email": "test@example.com",
            "password": "testpassword",
        }
        User.objects.create_user(email=data["email"], password=data["password"])

        response = self.client.post("/api/auth/token/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Check if the response contains the access token
        self.assertIn("access", response.data)

        # Check if the refresh token cookie is set
        self.assertIn(settings.SIMPLE_JWT["REFRESH_COOKIE"], response.cookies)

    def test_obtain_token_invalid_credentials(self):
        # Test obtaining a token with invalid credentials
        data = {
            "email": "test@example.com",
            "password": "invalidpassword",
        }
        User.objects.create_user(email=data["email"], password="testpassword")

        response = self.client.post("/api/auth/token/", data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_obtain_token_bad_request(self):
        # Test when the request data is invalid
        data = {"invalid_key": "Invalid Value"}

        response = self.client.post("/api/auth/token/", data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class RefreshTokenTestCase(APITestCase):
    def setUp(self):
        # Create a user and obtain a refresh token for testing
        self.user_data = {
            "email": "testuser@example.com",
            "password": "testpassword",
        }
        self.user = User.objects.create_user(email=self.user_data["email"], password=self.user_data["password"])
        self.refresh_token = self.obtain_refresh_token(self.user_data)

    def obtain_refresh_token(self, data):
        response = self.client.post("/api/auth/token/", data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        return response.data.get("refresh")

    def test_refresh_token_success(self):
        # Test refreshing a token successfully
        self.client.force_login(self.user)

        response = self.client.get("/api/auth/token/refresh/")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        # Check if the response contains the new access token
        self.assertIn("access", response.data)

    def test_refresh_token_no_cookie(self):
        # Test when the refresh token cookie is not present
        self.client.cookies = SimpleCookie({"name": "bla"})
        response = self.client.get("/api/auth/token/refresh/")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_refresh_token_invalid_token(self):
        # Test when an invalid refresh token is provided
        invalid_token = (
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiw"
            "ibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        )

        # Set an invalid refresh token in the cookie
        self.client.cookies[settings.SIMPLE_JWT["REFRESH_COOKIE"]] = invalid_token

        response = self.client.get("/api/auth/token/refresh/")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

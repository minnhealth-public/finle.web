from http.cookies import SimpleCookie

from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from rest_framework_simplejwt import tokens

from app_web.models import AccessToken, CareTeam, CareTeamMember
from allauth import usersessions

from .serializers import (
    FinleTokenObtainPairSerializer,
)

User = get_user_model()


class CreateAccountTestCase(APITestCase):
    def test_create_account_success(self):
        data = {
            "email": "test@example.com",
            "password": "testpassword1P-",
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
            "password": "testpassword1P-",
        }

        self.client.post("/api/auth/register", existing_user)

        duplicate_user = {
            "email": "existing@example.com",
            "password": "newpassword1P-",
        }

        response = self.client.post("/api/auth/register", duplicate_user)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("email", response.data)


class UpdateUserPasswordTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="testuser@test.com",
            password="testpassword1P-",
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        return super().setUp()

    def test_update_user_password(self):
        updated_data = {"new_password": "newpassword1P-"}

        response = self.client.put("/api/auth/change-password", updated_data)

        assert response.status_code == status.HTTP_200_OK

    def test_update_user_password_failure(self):
        updated_data = {"bnew_password": "newpassword1P-"}

        response = self.client.put("/api/auth/change-password", updated_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class UpdateUserTestCase(APITestCase):
    def test_update_user(self):
        self.client = APIClient()

        # setup user so that we are currently logged in as the user we are updating
        user_data = {
            "email": "test@example.com",
            "password": "testpassword1P-",
            "first_name": "bob",
            "last_name": "fred",
        }
        user = User.objects.create_user(
            email=user_data["email"],
            password=user_data["password"],
        )

        user.first_name = user_data["first_name"]
        user.last_name = user_data["last_name"]
        user.save()

        self.client.force_authenticate(user=user)

        updated_data = {
            "first_name": "bob 1",
            "last_name": "fred 1",
            "email": "test@example.com",
        }

        response = self.client.put("/api/auth/user", updated_data)

        assert response.status_code == status.HTTP_200_OK

        assert user.first_name == updated_data["first_name"]
        assert user.last_name == updated_data["last_name"]

    def test_update_for_authenticated(self):
        user_data = {
            "email": "test@example.com",
            "password": "testpassword1P-",
        }
        User.objects.create_user(
            email=user_data["email"],
            password=user_data["password"],
        )

        updated_data = {
            "first_name": "bob 1",
            "last_name": "fred 1",
        }

        response = self.client.put("/api/auth/user", updated_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_update_for_validation_error(self):
        self.client = APIClient()
        user_data = {
            "email": "test@example.com",
            "password": "testpassword1P-",
        }
        user = User.objects.create_user(
            email=user_data["email"],
            password=user_data["password"],
        )

        updated_data = {}

        self.client.force_authenticate(user=user)

        response = self.client.put("/api/auth/user", updated_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class ObtainTokenTestCase(APITestCase):
    def test_obtain_token_success(self):
        # Test obtaining a token successfully
        data = {
            "email": "test@example.com",
            "password": "testpassword1P-",
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
            "password": "testpassword1P-",
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


class LogoutTestCase(APITestCase):
    def setUp(self):
        # Create a user and obtain a refresh token for testing
        self.user_data = {
            "email": "testuser@example.com",
            "password": "testpassword1P-",
        }
        self.user = User.objects.create_user(email=self.user_data["email"], password=self.user_data["password"])

        self.sessionid = "blas"
        self.client.cookies = SimpleCookie({"sessionid": self.sessionid})

        self.user_session = usersessions.models.UserSession.objects.create(
            user=self.user,
            ip="192.168.65.1",
            session_key=self.sessionid
        )

    def test_logout_endpoint(self):
        assert len(usersessions.models.UserSession.objects.all()) == 1

        self.client.post("/api/auth/logout")

        assert len(usersessions.models.UserSession.objects.all()) == 0


class LoginWithTokenTestCase(APITestCase):
    def setUp(self):
        # Create a user and obtain a refresh token for testing
        self.user_data = {
            "email": "testuser@example.com",
            "password": "testpassword1P-",
        }
        self.user = User.objects.create_user(email=self.user_data["email"], password=self.user_data["password"])

    def test_login_with_token_bad(self):
        response = self.client.get("/api/auth/token/share?access=bad_access")
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_login_with_token(self):
        recipient = User.objects.create_user(email="bob@aol.com", password="letMeIn")
        refresh = FinleTokenObtainPairSerializer.get_token(recipient)

        token = AccessToken.objects.create(
            access_token=str(refresh),
            created_by=self.user,
            created_for=recipient,
        )

        response = self.client.get("/api/auth/token/share?access=" + str(token.id))

        assert response.status_code == status.HTTP_200_OK


class CreateTokenTestCase(APITestCase):
    def setUp(self):
        # Create a user and obtain a refresh token for testing
        self.user_data = {
            "email": "testuser@example.com",
            "password": "testpassword1P-",
        }
        self.user = User.objects.create_user(email=self.user_data["email"], password=self.user_data["password"])
        self.careteam = CareTeam.objects.create(name="myCare")
        self.admin_member = CareTeamMember.objects.create(member=self.user, team=self.careteam)
        self.admin_member.is_careteam_admin = True
        self.admin_member.save()

        self.recipient = User.objects.create_user(email="bob@aol.com", password=self.user_data["password"])
        self.client.force_authenticate(user=self.user)

    def test_create_share_token(self):

        data = {
            "team_id": self.careteam.id,
            "user_id": self.recipient.id,
        }

        CareTeamMember.objects.create(member=self.recipient, team=self.careteam)

        settings.EMAIL_HOST_USER = "hello@gmail.com"
        response = self.client.post("/api/auth/token/share/", data)

        assert response.status_code == status.HTTP_201_CREATED
        settings.EMAIL_HOST_USER = ""

    def test_create_share_token_none_admin(self):
        data = {
            "team_id": self.careteam.id,
            "user_id": self.recipient.id,
        }

        self.admin_member.is_careteam_admin = False
        self.admin_member.save()

        CareTeamMember.objects.create(member=self.recipient, team=self.careteam)

        response = self.client.post("/api/auth/token/share/", data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_share_token_not_part_of_team(self):
        data = {
            "team_id": self.careteam.id,
            "user_id": self.recipient.id,
        }

        response = self.client.post("/api/auth/token/share/", data)

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_create_share_token_bad_request(self):
        data = {
            "team_id": self.careteam.id,
        }

        response = self.client.post("/api/auth/token/share/", data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST


class RecoverAccount(APITestCase):
    def setUp(self):
        self.user_data = {
            "email": "testuser@example.com",
            "password": "testpassword1P-",
        }
        self.user = User.objects.create_user(email=self.user_data["email"], password=self.user_data["password"])

    def test_should_return_200_on_null_account(self):
        email = "bob@fred.com"
        user = User.objects.filter(email=email).first()
        response = self.client.post("/api/auth/recover-account/", {"email": email})
        assert response.status_code == status.HTTP_200_OK
        assert user is None

    def test_should_return_no_email_host_user(self):
        response = self.client.post("/api/auth/recover-account/", {"email": self.user_data["email"]})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_should_return_200(self):
        settings.EMAIL_HOST_USER = "hello@gmail.com"
        response = self.client.post("/api/auth/recover-account/", {"email": self.user_data["email"]})
        assert response.status_code == status.HTTP_200_OK
        settings.EMAIL_HOST_USER = ""

    def test_change_password(self):
        recover_token = tokens.AccessToken.for_user(self.user)

        response = self.client.post(
            "/api/auth/recover-account/reset",
            {"new_password": "testpassword1P-"},
            headers={"Authorization": "Bearer " + str(recover_token)},
        )

        assert response.status_code == status.HTTP_200_OK

    def test_bad_change_password(self):

        response = self.client.post(
            "/api/auth/recover-account/reset",
            {"new_password": "testpassword1P-"},
            headers={"Authorization": "Bearer bad_token"},
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

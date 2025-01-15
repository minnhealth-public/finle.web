from datetime import datetime, timedelta, timezone

from django.conf import settings
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions
from django.core.mail import EmailMultiAlternatives
from django.template.loader import get_template
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import AuthenticationFailed, ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt import tokens
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from app_web.models import AccessToken, CareTeamMember, User
from allauth import usersessions

from .serializers import (
    AccountRecoverSerializer,
    FinleTokenObtainPairSerializer,
    ShareTokenSerializer,
    UserChangePasswordSerializer,
    UserRegisterSerializer,
    UserSerializer,
    UserUpdateSerializer,
)
from .service import AuthService


@api_view(["POST"])
@permission_classes([AllowAny])
def create_account(request):
    """Endpoint for creating an account"""
    serializer = UserRegisterSerializer(data=request.data)

    try:
        serializer.is_valid(raise_exception=True)
        validate_password(request.data["password"])
        user = serializer.create(request.data)
        if user:
            resp = AuthService.generate_auth_response(user)
            return resp
    except ValidationError as exc:
        return Response(str(exc), status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        return Response(str(exc), status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_user(request):
    """Endpoint for updating an account"""
    try:
        # remove email if the same as the current user.
        # have to copy data because Query dict is immutable
        request_data = request.data.copy()
        if request_data.get("email") == request.user.email:
            request_data.pop("email")

        serializer = UserUpdateSerializer(data=request_data)
        if serializer.is_valid(raise_exception=True):
            serializer.update(request.user, serializer.validated_data)
            updated_user_serializer = UserSerializer(request.user)
            return Response(updated_user_serializer.data, status=status.HTTP_200_OK)
    except ValidationError as exc:
        return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)
    except Exception as exc:
        return Response(str(exc), status=status.HTTP_400_BAD_REQUEST)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def change_password(request):
    """Endpoint for change the user password"""
    serializer = UserChangePasswordSerializer(data=request.data)
    if serializer.is_valid():
        new_password = serializer.validated_data["new_password"]

        user = request.user
        user.set_password(new_password)
        user.save()
        return Response({"success": "Password changed successfully"}, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def get_token_for_auth(request):
    sessionid = request.COOKIES.get("sessionid")
    if not sessionid:
        return Response(status=status.HTTP_401_UNAUTHORIZED)
    try:
        user_session = usersessions.models.UserSession.objects.get(session_key=sessionid)
        user = User.objects.get(id=user_session.user_id)

        resp = AuthService.generate_auth_response(user)

        return resp

    except Exception as exc:
        return Response(str(exc), status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def logout(request):
    sessionid = request.COOKIES.get("sessionid")
    if not sessionid:
        return Response(status=status.HTTP_200_OK)
    try:
        usersessions.models.UserSession.objects.get(session_key=sessionid).delete()
        resp = Response(status=status.HTTP_200_OK)
        resp.delete_cookie("sessionid")
        resp.set_cookie("sessionid", max_age_seconds=1)

        return resp
    # if there is no usersession then we just return ok since we are already logged out.
    except usersessions.models.UserSession.DoesNotExist:
        return Response(status=status.HTTP_200_OK)
    except Exception as exc:
        return Response(str(exc), status=status.HTTP_400_BAD_REQUEST)


class ObtainToken(TokenObtainPairView):
    """Extending the TokenObtainPairView class so that we can put the refresh token as a http only cookie"""

    serializer_class = FinleTokenObtainPairSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})
        try:

            serializer.is_valid()
            resp = Response(
                {"access": str(serializer.validated_data["access"])},
                status=status.HTTP_200_OK,
            )
            # Set the cookie so that we can use refresh without storing data in localstorage
            AuthService.set_auth_cookie(resp, str(serializer.validated_data["refresh"]))
            return resp
        except AuthenticationFailed:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def login_with_share_token(request):
    """Logins with the share token that an admin has created"""
    if not request.GET.get("access"):
        return Response(status=status.HTTP_400_BAD_REQUEST)

    try:
        access = AccessToken.objects.get(id=request.GET.get("access"))

        refresh = RefreshToken(access.access_token)
        resp = Response({"access": str(refresh.access_token)}, status=status.HTTP_200_OK)
        # Set the cookie so that we can use refresh without storing data in localstorage
        AuthService.set_auth_cookie(resp, refresh)
        return resp
    # this is for when a valid uuid is not sent in the url
    except exceptions.ValidationError:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    except AccessToken.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    except TokenError:
        return Response(status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_share_token(request):
    """Takes in a request with verification then returns a new token"""

    try:
        serializer = ShareTokenSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        member = (
            CareTeamMember.objects.filter(
                member=request.user,
                team_id=serializer.data["team_id"],
            )
            .prefetch_related("team", "team__members")
            .first()
        )

        # Unsure that user is a team admin and requested access is given to user in team
        if not member.is_careteam_admin:
            return Response("You do not have admin rights to send access", status=status.HTTP_403_FORBIDDEN)

        if serializer.data["user_id"] not in [t_member.member_id for t_member in member.team.members.all()]:
            return Response("Recipient not in team", status=status.HTTP_403_FORBIDDEN)

        recipient = User.objects.get(id=serializer.data["user_id"])
        # Ensure that the requester is an admin in a team with the user sql query

        refresh = FinleTokenObtainPairSerializer.get_token(recipient)

        access = AccessToken.objects.create(
            access_token=str(refresh),
            created_by=request.user,
            created_for=recipient,
        )

        if not settings.EMAIL_HOST_USER or settings.EMAIL_HOST_USER == "":
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # plain text and html are used in case the email client does not have
        # html emails enabled.
        plaintext = get_template("emails/account_share/account_share.txt")
        htmly = get_template("emails/account_share/account_share.html")

        context = {
            "FRONT_END_HOST_URL": settings.FRONT_END_HOST,
            "TOKEN": access.id,
            "COMPANY": "finle",
        }

        msg = EmailMultiAlternatives(
            "Access Account",
            plaintext.render(context),
            settings.EMAIL_HOST_USER,
            [recipient.email],
        )

        msg.attach_alternative(htmly.render(context), "text/html")
        msg.send()

        return Response(status=status.HTTP_201_CREATED)

    except ValidationError:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    except Exception:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([AllowAny])
def refresh_token(request):
    """Takes in a request with verification then returns a new token"""
    raw_token = request.COOKIES.get(settings.SIMPLE_JWT["REFRESH_COOKIE"]) or None
    if raw_token is None:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    try:
        refresh = RefreshToken(raw_token)

        return Response({"access": str(refresh.access_token)}, status=status.HTTP_201_CREATED)
    except TokenError:
        return Response(status=status.HTTP_401_UNAUTHORIZED)


@api_view(["POST"])
@permission_classes([AllowAny])
def recover_account(request):
    """
    Given an account email send out the recover email with the recover
    token in the url link that will be good for five minutes.
    """

    try:
        serializer = AccountRecoverSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        user = User.objects.get(email=serializer.data["email"])

        current_time = datetime.now(tz=timezone.utc)

        # using the for_user uses the user password as the hash as a revoke token claim so there can only be
        # one active recovery token with the user
        recover_token = tokens.AccessToken.for_user(user)
        # set token to expire in ten minutes
        recover_token.set_exp("exp", current_time, timedelta(minutes=10))

        # if the email service is not setup then we'll have to return bad request
        if not settings.EMAIL_HOST_USER or settings.EMAIL_HOST_USER == "":
            return Response(status=status.HTTP_400_BAD_REQUEST)

        # plain text and html are used in case the email client does not have
        # html emails enabled.
        plaintext = get_template("emails/account_recover/account_recover.txt")
        htmly = get_template("emails/account_recover/account_recover.html")

        context = {
            "FRONT_END_HOST_URL": settings.FRONT_END_HOST,
            "RECOVERY_TOKEN": recover_token,
            "COMPANY": "finle",
        }

        msg = EmailMultiAlternatives(
            "Account Recover",
            plaintext.render(context),
            settings.EMAIL_HOST_USER,
            [user.email],
        )

        msg.attach_alternative(htmly.render(context), "text/html")
        msg.send()

        return Response(status=status.HTTP_200_OK)

    except ValidationError:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    except User.DoesNotExist:
        # for security we don't want a bad actor to know whether an email exists in our system our not so return
        # a success even if that user doesn't exist.
        return Response(status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def recover_reset(request):
    """This is a recovery end point that requires the auth of the recovery token above to work"""

    try:
        serializer = UserChangePasswordSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)
        new_password = serializer.validated_data["new_password"]

        user = request.user
        user.set_password(new_password)
        user.save()

        return Response(status=status.HTTP_200_OK)

    except ValidationError:
        return Response(status=status.HTTP_400_BAD_REQUEST)

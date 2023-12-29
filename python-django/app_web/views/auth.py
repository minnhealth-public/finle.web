from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from app_web.serializers import FinleTokenObtainPairSerializer, UserRegisterSerializer


@api_view(["POST"])
@permission_classes([AllowAny])
def create_account(request):
    """Endpoint for creating an account"""
    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid(raise_exception=True):
        user = serializer.create(request.data)
        if user:
            refresh = RefreshToken.for_user(user)
            data = {
                "access": str(refresh.access_token),
            }
            resp = Response(data, status=status.HTTP_201_CREATED)
            # Set the cookie so that we can use refresh without storing data in localstorage
            resp.set_cookie(
                key=settings.SIMPLE_JWT["REFRESH_COOKIE"],
                httponly=settings.SIMPLE_JWT["REFRESH_COOKIE_HTTP_ONLY"],
                secure=settings.SIMPLE_JWT["REFRESH_COOKIE_SECURE"],
                samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                value=str(refresh),
            )
            return resp

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ObtainToken(TokenObtainPairView):
    """Extending the TokenObtainPairView class so that we can put the refresh token as a http only cookie"""

    serializer_class = FinleTokenObtainPairSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data, context={"request": request})

        try:
            if serializer.is_valid(raise_exception=True):
                resp = Response(
                    {"access": str(serializer.validated_data["access"])},
                    status=status.HTTP_200_OK,
                )
                # Set the cookie so that we can use refresh without storing data in localstorage
                resp.set_cookie(
                    key=settings.SIMPLE_JWT["REFRESH_COOKIE"],
                    httponly=settings.SIMPLE_JWT["REFRESH_COOKIE_HTTP_ONLY"],
                    secure=settings.SIMPLE_JWT["REFRESH_COOKIE_SECURE"],
                    samesite=settings.SIMPLE_JWT["AUTH_COOKIE_SAMESITE"],
                    value=str(serializer.validated_data["refresh"]),
                )
                return resp
        except AuthenticationFailed:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
# @permission_classes([AllowAny])
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

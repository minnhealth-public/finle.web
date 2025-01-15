import datetime

from django.contrib.auth import get_user_model
from rest_framework.serializers import CharField, EmailField, IntegerField, ModelSerializer, Serializer
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from app_web.models import User

from .validators import validate_password

UserModel = get_user_model()


class UserSerializer(ModelSerializer):
    class Meta:
        model = UserModel
        fields = ["id", "first_name", "last_name", "email", "last_login"]


class UserRegisterSerializer(ModelSerializer):
    class Meta:
        model = UserModel
        fields = ["first_name", "last_name", "email", "last_login"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = UserModel.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
        )
        user.first_name = validated_data.get("firstName", "")
        user.last_name = validated_data.get("lastName", "")
        user.save()
        return user


class FinleTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user: User):
        # when we get a token update the last login date
        token = super().get_token(user)

        # Add custom claims
        token["firstName"] = user.first_name
        token["lastName"] = user.last_name
        token["email"] = user.email
        token["lastLogin"] = user.last_login.strftime("%Y-%m-%d %H:%M:%S %Z") if user.last_login is not None else None
        user.last_login = datetime.datetime.now(datetime.timezone.utc)
        user.save()
        # ...

        return token


class ShareTokenSerializer(Serializer):
    team_id = IntegerField(required=True)
    user_id = IntegerField(required=True)


class UserChangePasswordSerializer(Serializer):
    new_password = CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value


class AccountRecoverSerializer(Serializer):
    email = EmailField(required=True)


class UserUpdateSerializer(ModelSerializer):
    class Meta:
        model = UserModel
        fields = ["first_name", "last_name", "email"]
        extra_kwargs = {"email": {"required": False}, "first_name": {"required": True}, "last_name": {"required": True}}

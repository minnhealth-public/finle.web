import datetime

from django.contrib.auth import get_user_model
from rest_framework.serializers import (
    BooleanField,
    CharField,
    IntegerField,
    ModelSerializer,
    Serializer,
    SerializerMethodField,
    SlugRelatedField,
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from app_web.models import CareTeam, CareTeamMember, Clip, GlossaryTerm, Partner, Story, User

UserModel = get_user_model()


class ClipSerializer(ModelSerializer):
    video = SlugRelatedField(many=False, read_only=True, slug_field="video_id")
    end_time = SerializerMethodField()
    start_time = SerializerMethodField()
    longer_clip = SerializerMethodField()
    entire_clip = SerializerMethodField()

    class Meta:
        model = Clip
        fields = (
            "id",
            "name",
            "description",
            "video",
            "start_time",
            "end_time",
            "topics_addressed",
            "longer_clip",
            "entire_clip",
        )

    @staticmethod
    def get_end_time(obj):
        return int(obj.end_time.total_seconds())

    @staticmethod
    def get_start_time(obj):
        return int(obj.start_time.total_seconds())

    @staticmethod
    def get_longer_clip(obj):
        if obj.parent is not None and obj.parent.type == Clip.ClipType.MEDIUM:
            return obj.parent.video.id
        return None

    @staticmethod
    def get_entire_clip(obj):
        if obj.parent is not None:
            if obj.parent.type == Clip.ClipType.LONG:
                return obj.parent.video.id
            if obj.parent.type == Clip.ClipType.MEDIUM and obj.parent.parent is not None:
                return obj.parent.parent.video.id
        return None


class ClipParentSerializer(ModelSerializer):
    class Meta:
        model = Clip
        fields = ("id", "name")


class GlossaryTermSerializer(ModelSerializer):
    class Meta:
        model = GlossaryTerm
        fields = "__all__"


class StorySerializer(ModelSerializer):
    class Meta:
        model = Story
        fields = "__all__"


class PartnerSerializer(ModelSerializer):
    class Meta:
        model = Partner
        fields = "__all__"


# class NoteSerializer(ModelSerializer):
#     class Meta:
#         model = Note
#         fields = '__all__'


class UserRegisterSerializer(ModelSerializer):
    class Meta:
        model = UserModel
        fields = "__all__"
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, clean_data):
        user = UserModel.objects.create_user(
            email=clean_data["email"],
        )
        user.set_password(clean_data["password"])
        user.save()
        return user


class CareTeamSerializer(ModelSerializer):
    members = SerializerMethodField()

    class Meta:
        model = CareTeam
        fields = ["id", "name", "members"]

    def get_members(self, obj):
        return CareTeamMemberSerializer(obj.members, many=True).data


class CareTeamPostSerializer(ModelSerializer):
    class Meta:
        model = CareTeam
        fields = "__all__"


class CareTeamMemberSerializer(ModelSerializer):
    first_name = SerializerMethodField()
    last_name = SerializerMethodField()
    email = SerializerMethodField()

    class Meta:
        model = CareTeamMember
        fields = ["id", "team_id", "first_name", "last_name", "email", "relation", "is_careteam_admin"]

    def get_first_name(self, obj):
        return obj.member.first_name

    def get_last_name(self, obj):
        return obj.member.last_name

    def get_email(self, obj):
        return obj.member.email


class CareTeamMemberRemoveSerailizer(Serializer):
    member_id = IntegerField(read_only=True)


class CareTeamMemberUpdateSerailizer(Serializer):
    member_id = IntegerField(read_only=True)
    relation = CharField(read_only=True)
    is_careteam_admin = BooleanField(read_only=True)


# class NoteSerializer(ModelSerializer):
#     class Meta:
#         model = Note
#         fields = '__all__'


class FinleTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user: User):
        # when we get a token update the last login date
        token = super().get_token(user)

        # Add custom claims
        token["firstName"] = user.first_name
        token["lastName"] = user.last_name
        token["lastLogin"] = user.last_login.strftime("%Y-%m-%d %H:%M:%S %Z") if user.last_login is not None else None
        user.last_login = datetime.datetime.now(datetime.timezone.utc)
        user.save()
        # ...

        return token

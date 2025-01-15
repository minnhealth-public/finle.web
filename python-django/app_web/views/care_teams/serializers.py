from rest_framework.serializers import (
    BooleanField,
    CharField,
    IntegerField,
    ModelSerializer,
    Serializer,
    SerializerMethodField,
)

from app_web.models import (
    CareTeam,
    CareTeamMember,
)


class CareTeamSerializer(ModelSerializer):
    members = SerializerMethodField()

    class Meta:
        model = CareTeam
        fields = ["id", "name", "members", "is_setup_complete"]

    def get_members(self, obj):
        return CareTeamMemberSerializer(obj.members, many=True).data


class CareTeamPostSerializer(ModelSerializer):
    class Meta:
        model = CareTeam
        fields = "__all__"


class CareTeamUpdateSerializer(Serializer):
    name = CharField(read_only=True)


class CareTeamMemberSerializer(ModelSerializer):
    first_name = SerializerMethodField()
    last_name = SerializerMethodField()
    email = SerializerMethodField()

    class Meta:
        model = CareTeamMember
        fields = [
            "id",
            "team_id",
            "member_id",
            "first_name",
            "last_name",
            "email",
            "relation",
            "notification_count",
            "is_careteam_admin",
            "is_caree",
        ]

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

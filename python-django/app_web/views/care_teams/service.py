from django.db import connection


class CareTeamService:
    """Helper to abstract logic so it can be reused."""

    @classmethod
    def update_team_notifications(cls, team_id: int, user_id: int):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                UPDATE app_web_careteammember SET notification_count = notification_count + 1
                WHERE app_web_careteammember.team_id = %s AND app_web_careteammember.member_id != %s
           """,
                [team_id, user_id],
            )

from django.db import connection
from app_web.utils import wrap_glossary_term


class ClipService:
    """Helper to abstract logic so it can be reused."""

    @classmethod
    def get_clip_key_takeaways(cls, clip_id: int):
        with connection.cursor() as cursor:
            cursor.execute(
                """
                SELECT
                    app_web_keytakeaway.id,
                    app_web_clip.id as clip_id,
                    app_web_clip.name as clip_name,
                    app_web_keytakeaway.text,
                    app_web_clip.start_time,
                    app_web_clip.end_time
                FROM app_web_keytakeaway
                JOIN app_web_clip_key_takeaways ON app_web_clip_key_takeaways.keytakeaway_id = app_web_keytakeaway.id
                    AND app_web_clip_key_takeaways.clip_id in
                        (SELECT app_web_clip.id FROM app_web_clip
                            WHERE app_web_clip.parent_id IN (
                            SELECT id FROM app_web_clip
                            WHERE app_web_clip.parent_id = %s
                            )
                        OR  app_web_clip.parent_id =  %s
                        OR  app_web_clip.id = %s
                        )
                JOIN app_web_clip ON app_web_clip_key_takeaways.clip_id = app_web_clip.id
                ORDER BY app_web_clip.start_time
                """,
                [clip_id, clip_id, clip_id],
            )

            # zip rows into a dictionary for the serializer to convert to json
            columns = [col[0] for col in cursor.description]
            rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

            for row in rows:
                if 'text' in row:
                    row['text'] = wrap_glossary_term(row['text'])

            return rows

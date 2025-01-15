# Generated by Django 4.2.10 on 2024-04-29 20:15

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ("app_web", "0030_clipuser_rating"),
    ]

    operations = [
        migrations.CreateModel(
            name="AccessToken",
            fields=[
                ("id", models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ("access_token", models.TextField()),
                ("expiration_date", models.DateField(blank=True, null=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="user_access_grants",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "created_for",
                    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
                ),
            ],
        ),
    ]

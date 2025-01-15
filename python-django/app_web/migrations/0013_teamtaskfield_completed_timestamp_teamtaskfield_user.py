# Generated by Django 4.2.3 on 2024-02-20 20:42

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("app_web", "0012_remove_task_task_fields_taskfield_task_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="teamtaskfield",
            name="completed_timestamp",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="teamtaskfield",
            name="user",
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
            preserve_default=False,
        ),
    ]

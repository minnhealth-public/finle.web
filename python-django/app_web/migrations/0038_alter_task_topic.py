# Generated by Django 4.2.10 on 2024-07-29 17:07

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("app_web", "0037_topic_archived"),
    ]

    operations = [
        migrations.AlterField(
            model_name="task",
            name="topic",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.RESTRICT, related_name="tasks", to="app_web.topic"
            ),
        ),
    ]
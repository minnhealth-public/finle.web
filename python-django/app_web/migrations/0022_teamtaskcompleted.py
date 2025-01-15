# Generated by Django 4.2.10 on 2024-03-28 18:09

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("app_web", "0021_priority_task_is_setup_question_task_ranking"),
    ]

    operations = [
        migrations.CreateModel(
            name="TeamTaskCompleted",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("modified_timestamp", models.DateTimeField(blank=True, null=True)),
                ("task", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="app_web.task")),
                ("team", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="app_web.careteam")),
            ],
        ),
    ]
# Generated by Django 4.2.10 on 2024-03-09 14:31

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("app_web", "0020_remove_careteam_caree_careteammember_is_caree"),
    ]

    operations = [
        migrations.CreateModel(
            name="Priority",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("value", models.IntegerField(unique=True)),
            ],
            options={
                "verbose_name_plural": "priorities",
            },
        ),
        migrations.AddField(
            model_name="task",
            name="is_setup_question",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="task",
            name="ranking",
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="priority",
                to="app_web.priority",
            ),
        ),
    ]

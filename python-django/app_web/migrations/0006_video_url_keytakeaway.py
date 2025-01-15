# Generated by Django 4.2.8 on 2024-01-10 17:53

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("app_web", "0005_video_production_year_video_quality"),
    ]

    operations = [
        migrations.AddField(
            model_name="video",
            name="url",
            field=models.URLField(null=True),
        ),
        migrations.CreateModel(
            name="KeyTakeaway",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("text", models.TextField(blank=True, null=True)),
                ("clip", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="app_web.clip")),
            ],
        ),
    ]

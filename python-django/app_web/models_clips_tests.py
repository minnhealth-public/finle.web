import json
from datetime import timedelta

import pytest
from django.urls import reverse
from rest_framework import status

from app_web import models


@pytest.fixture(autouse=True)
@pytest.mark.django_db()
def channel():
    """Add a channel to the database."""
    # Setup
    return models.Channel.objects.create(name="test_channel", description="the test channel")

    # Tear down


@pytest.fixture(autouse=True)
@pytest.mark.django_db()
def video(channel):
    """Add a video to the database."""
    # Setup
    return models.Video.objects.create(
        name="test_video",
        description="the test video",
        streaming_service=models.Video.StreamingService.YOUTUBE,
        video_id="dQw4w9WgXcQ",
        channel=channel,
    )

    # Tear down


@pytest.fixture(autouse=True)
@pytest.mark.django_db()
def clips(video):
    """Add a set of clips to the database, one for each clip type."""
    # Setup
    clips_list = []
    for idx, clip_type in enumerate(models.Clip.ClipType):
        clip_obj = models.Clip.objects.create(
            name=f"{clip_type.title()} clip",
            description=f"The {clip_type.title()} clip",
            video=video,
            type=clip_type,
            start_time=timedelta(seconds=0),
            end_time=timedelta(seconds=10 * (idx + 1)),
        )
        clips_list.append(clip_obj)

    return clips_list

    # Tear down


@pytest.mark.django_db()
class TestVideoAndClips:
    def test_video(self, video):
        assert isinstance(video, models.Video)

    def test_clips(self, clips):
        assert isinstance(clips[0], models.Clip)
        assert len(clips) == len(models.Clip.ClipType)


@pytest.mark.django_db()
class TestShortsApi:
    def test_api_routes(self, client):
        """Fetch list of api elements."""
        response = client.get(reverse("routes"))
        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("Content-Type") == "application/json"

        # Routes should be valid json
        api_content = json.loads(response.content)

        # Grab endpoints from the api listings and audit the list for a few expected items
        endpoints = {item.get("Endpoint") for item in api_content}
        assert None not in endpoints
        assert "/api/shorts" in endpoints
        assert "/api/shorts/{id}" in endpoints

    def test_api_shorts_all(self, client, clips):
        """Fetch all video shorts via the api."""
        response = client.get(reverse("shorts"))
        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("Content-Type") == "application/json"
        shorts = [(short["id"], short["name"]) for short in response.data]
        clip_short = next(iter([short for short in clips if short.type == models.Clip.ClipType.SHORT]))
        assert (clip_short.id, clip_short.name) in shorts

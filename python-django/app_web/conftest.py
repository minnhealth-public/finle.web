from datetime import timedelta

import pytest
from rest_framework.test import APIClient

from app_web import models


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture(autouse=True)
def channel():
    """Add a channel to the database."""
    # Setup
    return models.Channel.objects.create(name="test_channel", description="the test channel")


@pytest.fixture(autouse=True)
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


@pytest.fixture(autouse=True)
def clips(video):
    """Add a set of clips to the database, one for each clip type."""
    # Setup
    clips_list = []
    for idx, clip_type in enumerate(models.Clip.ClipType):
        clip_obj = models.Clip.objects.create(
            name=f"{clip_type.title()} clip",
            video=video,
            type=clip_type,
            start_time=timedelta(seconds=0),
            end_time=timedelta(seconds=10 * (idx + 1)),
        )
        clips_list.append(clip_obj)

    return clips_list

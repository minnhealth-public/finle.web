import pytest

from app_web import models


@pytest.mark.django_db()
class TestVideoAndClips:
    def test_video(self, video):
        assert isinstance(video, models.Video)

    def test_clips(self, clips):
        assert isinstance(clips[0], models.Clip)
        assert len(clips) == len(models.Clip.ClipType)

from django.test import TestCase
from django.test.client import RequestFactory
from app_web import utils, models
import pytest


class TestCheckLinkUtils(TestCase):

    def test_check_link(self):
        assert utils.check_link("http://www.google.com")

    def test_check_bad_link(self):
        assert not utils.check_link("http://www.googlekkkkkkkkkkkkkkkk.com")


class TestClipQuery(TestCase):

    def setup(self):
        self.chan = models.Channel.objects.create(name="test_channel", description="the test channel")
        self.video = models.Video.objects.create(
            name="test_video",
            description="the test video",
            streaming_service=models.Video.StreamingService.YOUTUBE,
            video_id="dQw4w9WgXcQ",
            channel=self.chan,
        )

    def test_video_id_none(self):
        assert not utils.get_clip_queryset(None, "SHORT")
        assert not utils.get_clip_queryset(None, "MEDIUM")
        assert not utils.get_clip_queryset(None, "LONG")

    def test_video_id_doesnt_exist(self):
        assert not utils.get_clip_queryset(5, "SHORT")
        assert not utils.get_clip_queryset(5, "MEDIUM")

    @pytest.mark.usefixtures("clips")
    def test_video_id(self):
        self.video = models.Video.objects.first()
        # This asserts ensures that there is a queryset that is none empty
        assert utils.get_clip_queryset(self.video.id, "SHORT")
        assert utils.get_clip_queryset(self.video.id, "MEDIUM")


class TestGetHost(TestCase):

    def test_get_host_secure(self):
        factory = RequestFactory()
        req = factory.get('/api/shorts/', secure=True)
        host = utils.get_host(req)
        assert f"https://{req.get_host()}" == host

    def test_get_host_unsecure(self):
        factory = RequestFactory()
        req = factory.get('/api/shorts/')
        host = utils.get_host(req)
        assert f"http://{req.get_host()}" == host


class TestReverseQuerystring(TestCase):

    def test_with_kwargs(self):
        url = utils.reverse_querystring(
            "shorts",
            query_kwargs={
                "topics": "1",
                "played": "played",
                "saved": "saved",
                "unplayed": "unplayed",
                "query": "test",
                "team_id": "1",
            },
        )
        assert "played" in url
        assert "saved" in url
        assert "query" in url
        assert "team_id" in url

    def test_without_kwargs(self):
        url = utils.reverse_querystring("shorts")
        assert url

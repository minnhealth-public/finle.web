import json
from datetime import timedelta

import pytest
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from app_web import models
from app_web.utils import reverse_querystring

User = get_user_model()


@pytest.mark.django_db()
@pytest.mark.usefixtures("clips")
class TestShortsApi(APITestCase):
    def setUp(self):
        self.clip = models.Clip.objects.first()
        self.user = User.objects.create_user(email="testuser@test.com", password="testpassword")

        # create team and member for user
        self.team = models.CareTeam.objects.create(name="Helpers")
        models.CareTeamMember.objects.create(team=self.team, member=self.user)

        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.clip_user = models.ClipUser.objects.create(user=self.user, clip=self.clip)

        return super().setUp()

    def test_api_routes(self):
        """Fetch list of api elements."""
        response = self.client.get(reverse("routes"))
        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("Content-Type") == "application/json"

        # Routes should be valid json
        api_content = json.loads(response.content)

        # Grab endpoints from the api listings and audit the list for a few expected items
        endpoints = {item.get("Endpoint") for item in api_content}
        assert None not in endpoints
        assert "/api/shorts" in endpoints
        assert "/api/shorts/{id}" in endpoints

    def test_api_shorts_all(self):
        """Fetch all video shorts via the api."""
        clips = models.Clip.objects.filter(type=models.Clip.ClipType.SHORT).all()
        response = self.client.get(reverse("shorts"))
        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("Content-Type") == "application/json"
        shorts = [(short["id"], short["name"]) for short in response.data["results"]]
        clip_short = next(iter([short for short in clips]))
        assert (clip_short.id, clip_short.name) in shorts

    def test_api_shorts_with_archived_topic(self):
        arch_clip = models.Clip.objects.create(
            name="topic archived clip",
            video=models.Video.objects.first(),
            type=models.Clip.ClipType.SHORT,
            start_time=timedelta(seconds=0),
            end_time=timedelta(seconds=10 * (5)),
        )

        topic = models.Topic.objects.create(name="Care", archived=True)
        models.ClipAddressedTopic.objects.create(clip=arch_clip, topic=topic)

        response = self.client.get(reverse("shorts"))
        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("Content-Type") == "application/json"

        shorts = [(short["id"], short["name"]) for short in response.data["results"]]
        assert (arch_clip.id, arch_clip.name) not in shorts

        clips = models.Clip.objects.filter(type=models.Clip.ClipType.SHORT).all()
        all_shorts = [(short.id, short.name) for short in clips]
        assert (arch_clip.id, arch_clip.name) in all_shorts

    def test_api_shorts_with_archived(self):
        """Fetch all video shorts via the api."""
        arch_clip = models.Clip.objects.create(
            name="archived clip",
            video=models.Video.objects.first(),
            type=models.Clip.ClipType.SHORT,
            start_time=timedelta(seconds=0),
            archived=True,
            end_time=timedelta(seconds=10 * (5)),
        )

        response = self.client.get(reverse("shorts"))
        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("Content-Type") == "application/json"

        shorts = [(short["id"], short["name"]) for short in response.data["results"]]
        assert (arch_clip.id, arch_clip.name) not in shorts

        clips = models.Clip.objects.filter(type=models.Clip.ClipType.SHORT).all()
        all_shorts = [(short.id, short.name) for short in clips]
        assert (arch_clip.id, arch_clip.name) in all_shorts

    def test_api_shorts_with_archived_video(self):
        """Fetch all video shorts via the api."""
        arch_video = models.Video.objects.create(
            name="archived_video",
            description="the test archive video",
            streaming_service=models.Video.StreamingService.YOUTUBE,
            video_id="dQw4w9WgXcQkdkd",
            archived=True,
            channel=models.Channel.objects.first(),
        )

        arch_clip = models.Clip.objects.create(
            name="archived clip",
            video=arch_video,
            type=models.Clip.ClipType.SHORT,
            start_time=timedelta(seconds=0),
            end_time=timedelta(seconds=10 * (5)),
        )

        response = self.client.get(reverse("shorts"))
        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("Content-Type") == "application/json"

        shorts = [(short["id"], short["name"]) for short in response.data["results"]]
        assert (arch_clip.id, arch_clip.name) not in shorts

        clips = models.Clip.objects.filter(type=models.Clip.ClipType.SHORT).all()
        all_shorts = [(short.id, short.name) for short in clips]
        assert (arch_clip.id, arch_clip.name) in all_shorts

    def test_api_shorts_with_filters_no_match(self):
        url = reverse_querystring(
            "shorts",
            query_kwargs={
                "topics": "1",
                "played": "played",
                "saved": "saved",
                "unplayed": "unplayed",
                "query": "test",
                "team_id": self.team.id,
            },
        )
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        # there is no match for the above
        assert len(response.data["results"]) == 0

    def test_api_shorts_with_id(self):
        clip = models.Clip.objects.first()
        url = reverse(
            "get_short",
            kwargs={"clip_id": clip.id},
        )
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        # there is no match for the above
        assert response.data["name"] == clip.name

    def test_api_shorts_get_related_clips(self):
        clip = models.Clip.objects.first()
        url = reverse(
            "get_related_shorts",
            kwargs={"clip_id": clip.id},
        )
        response = self.client.get(url)
        assert response.status_code == status.HTTP_200_OK
        # number of related clips for clip of id 1 is defined in the dataset
        # there is no match for the above

    def test_short_put_watch(self):
        assert self.clip.user_info.all()[0].watched is False
        response = self.client.put(reverse("put_watch_shorts"), {"clip_ids": [self.clip.id]})
        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert self.clip.user_info.all()[0].watched is True

    def test_short_put_save(self):
        assert self.clip_user.saved is False
        response = self.client.put(reverse("put_save_short", kwargs={"clip_id": self.clip.id}))
        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert self.clip.user_info.all()[0].saved is True

    def test_short_put_rating(self):
        assert self.clip_user.rating is None
        url = reverse("put_rating_short", kwargs={"clip_id": self.clip.id})
        response = self.client.put(url, data={"rating": 2})
        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert self.clip.user_info.all()[0].rating == 2

    def test_short_put_unsave(self):
        self.clip_user.saved = True
        self.clip_user.save()
        assert self.clip_user.saved is True
        response = self.client.put(reverse("put_unsave_short", kwargs={"clip_id": self.clip.id}))
        assert response.status_code == status.HTTP_204_NO_CONTENT

        assert models.ClipUser.objects.all()[0].saved is False

    def test_short_get_featured(self):
        models.FeaturedClip.objects.create(clip=self.clip)
        response = self.client.get(reverse("get_featured_shorts"))
        assert response.status_code == status.HTTP_200_OK
        assert len(response.data) == 1
        assert response.data[0]["name"] == self.clip.name

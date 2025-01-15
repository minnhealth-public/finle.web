from app_web import models
from django.urls import reverse
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status


class GlossaryAPITests(APITestCase):
    def setUp(self):
        self.glossary_term = models.GlossaryTerm.objects.create(
            term="intervention",
            definition="confront an individual with a problem",
            source="google.com",
        )

    def test_get_term(self):
        resp = self.client.get(
            reverse("get_glossary_term", kwargs={"term_id": self.glossary_term.id})
        )

        assert resp.data["id"] == self.glossary_term.id

    def test_get_term_bad_request(self):
        resp = self.client.get(
            reverse("get_glossary_term", kwargs={"term_id": 56})
        )

        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_get_terms(self):
        glossary_term = models.GlossaryTerm.objects.create(
            term="inter",
            definition="a problem",
            source="yahoo.com",
        )

        resp = self.client.get(reverse("get_glossary_terms"))

        ids = [row["id"] for row in resp.data]

        assert self.glossary_term.id in ids
        assert glossary_term.id in ids


class GlossaryCheckLink(TestCase):
    def setUp(self):
        user = models.User.objects.create(
            email="john@google.com",
            is_staff=True)
        user.set_password("letmein")
        user.save()
        self.client.force_login(user)

    def test_check_links(self):
        resp = self.client.get(reverse("check_glossary_links"))

        assert resp.status_code == status.HTTP_200_OK

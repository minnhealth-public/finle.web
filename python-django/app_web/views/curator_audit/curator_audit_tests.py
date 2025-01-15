import pytest
from django.urls import reverse
from rest_framework import status


@pytest.mark.django_db()
class TestCuratorAccess:
    def test_redirect_to_login(self, client):
        """Verifies that a non-admin user is redirected to the admin login."""
        url = reverse("curator_audit")
        response = client.get(url)
        assert response.status_code == status.HTTP_302_FOUND
        redirect_location = response["Location"]
        assert redirect_location == f"/admin/login/?next={url}"

        response = client.post(url)
        assert response.status_code == status.HTTP_302_FOUND
        redirect_location = response["Location"]
        assert redirect_location == f"/admin/login/?next={url}"


@pytest.mark.django_db()
class TestCuratorAdmin:

    def test_audit_report_refresh(self, client, admin_user):
        client.force_login(admin_user)
        url = reverse("curator_audit")
        response = client.post(url)
        assert response.status_code == status.HTTP_200_OK

    def test_audit_report_cached_explicit(self, client, admin_user):
        client.force_login(admin_user)
        url = reverse("curator_audit")
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK

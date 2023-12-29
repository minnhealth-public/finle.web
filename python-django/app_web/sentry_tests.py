import pytest
from django.urls import reverse


@pytest.mark.django_db()
class TestSentryError:
    def test_sentry_divide_by_zero(self, client):
        """Invoke the sentry test page with a keyword arg for the input variable."""
        url = reverse("sentry-test", kwargs={"test_val": "1"})
        with pytest.raises(ZeroDivisionError):
            _ = client.get(url)

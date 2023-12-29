import re

import pytest
from django.urls import reverse
from rest_framework import status

from app_web.pytest_utils import get_response_code_from_up_to_one_redirect
from app_web.urls import urlpatterns

# High-level 'app_web' tests belong here.
# Note that you can invoke pytest from the command line by running "pytest --ds=app_web.settings --cov"
# Run "coverage report -m" to look at a test coverage report of untested lines of code


# this will start to break down when we require auth and other items so this will need to be redone.
@pytest.mark.django_db()
class TestUriLoad:
    @pytest.mark.parametrize("app_web_uri", [uri for uri in urlpatterns if not uri.pattern.converters])
    def test_uri_load(self, app_web_uri, client):
        """Test load of pages that do not have any URI pattern."""
        if "static/" in str(app_web_uri.pattern):
            return  # Skip static content

        # print(f"Checking {app_web_uri}")
        uri_name = getattr(app_web_uri, "name", None)
        uri_pattern = getattr(app_web_uri, "pattern", None)
        # TODO -MGH- create separate tests for each view and deprecate this module

        # Auth pages do not return 200
        if re.match(r"[\\/]*api/(auth|care-teams|user)", str(uri_pattern)):
            print(f"Found and check: {uri_pattern}")
            url = reverse(uri_name)
            expected_response_code = [
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_405_METHOD_NOT_ALLOWED,
            ]
        elif uri_name is not None:  # Use uri nickname if possible
            url = reverse(uri_name)
            expected_response_code = [status.HTTP_200_OK]
        elif uri_pattern is not None:  # User uri pattern if there is no name
            url = "/" + str(uri_pattern)
            expected_response_code = [status.HTTP_200_OK]
        else:
            raise ValueError("URI name/pattern lookup failed for {app_web_uri}")

        # print(f"URI: {url}")
        assert get_response_code_from_up_to_one_redirect(client, url) in expected_response_code

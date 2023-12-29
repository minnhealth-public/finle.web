import logging

import pytest
from rest_framework import status

logger = logging.getLogger(__name__)


@pytest.mark.django_db()
def get_response_code_from_up_to_one_redirect(client, url) -> int:
    response = client.get(url)
    status_code = response.status_code

    # If we received a redirect, follow it to ensure that the redirected page loads without an error
    if response.status_code == status.HTTP_302_FOUND:
        location = response["Location"]
        logger.info("redirect to %s", location)
        redirect = client.get(location)
        status_code = redirect.status_code

    return status_code

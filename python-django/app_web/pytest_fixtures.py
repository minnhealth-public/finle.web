import pytest

from app_web import models


@pytest.fixture(autouse=True)
def finle_standard_user():
    """Create and return a user object with standard privileges."""
    # Setup
    # Add a standard user
    user_obj = models.User.objects.create_user(email="standard_user@finle.com", password="testUser123!")

    # yield the resource to the caller
    return user_obj

    # Tear down

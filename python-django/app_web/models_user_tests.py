"""Check the user models for both admin and standard users.

Note that `admin_user` is a Django built-in fixture for a superuser and that `finle_standard_user` is created
by the models.

"""

import pytest
from django.db import connection

from app_web.models import User
from app_web.pytest_fixtures import finle_standard_user  # noqa F401

# TODO: -MGH- Fix up noqas for flake8/pytest import conflict


@pytest.mark.django_db()
class TestDatabaseCheck:
    def test_testing_db(self):
        """Check that the database we are using is the test database.

        This was the first model test using the test_postgres instance
        """
        # Verify that we are on the test DB (only once on this test)
        db_name = connection.settings_dict["NAME"]
        assert db_name == "test_postgres"


@pytest.mark.django_db()
class TestUsers:
    @pytest.mark.usefixtures("admin_user")
    def test_admin_user_exists(self, admin_user):
        """Check the attributes of the admin user."""
        assert isinstance(admin_user, User)
        permissions = admin_user.get_all_permissions()
        assert "auth.change_permission" in permissions
        assert "admin.delete_logentry" in permissions

    @pytest.mark.usefixtures("finle_standard_user")
    def test_standard_user_exists(self, finle_standard_user):  # noqa F811
        """Check the attributes of the standard user."""
        assert isinstance(finle_standard_user, User)
        permissions = finle_standard_user.get_all_permissions()
        assert "auth.change_permission" not in permissions
        assert "admin.delete_logentry" not in permissions

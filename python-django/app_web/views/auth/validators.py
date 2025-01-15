# import the logging library
import logging
import re

from django.core.exceptions import ValidationError

# Get an instance of a logger
logger = logging.getLogger(__name__)


def validate_password(value: str):
    """Validation function for passwords."""
    uppercase_pattern = re.compile(r"[A-Z]")
    lowercase_pattern = re.compile(r"[a-z]")
    digit_pattern = re.compile(r"[0-9]")
    special_char_pattern = re.compile(r'[!@#\$%\^&\*\(\)_\+\-\=\[\]\{\};:\'",<>\.\?\/`~]')
    errors = []

    # Check password length
    if len(value) < 12 or len(value) > 64:
        errors.append("Password must be between 12 and 64 characters long.")

    # Check for at least one uppercase letter
    if not uppercase_pattern.search(value):
        errors.append("Password must include at least one uppercase letter (A-Z).")

    # Check for at least one lowercase letter
    if not lowercase_pattern.search(value):
        errors.append("Password must include at least one lowercase letter (a-z).")

    # Check for at least one digit
    if not digit_pattern.search(value):
        errors.append("Password must include at least one digit (0-9).")

    # Check for at least one special character
    if not special_char_pattern.search(value):
        errors.append(
            """
            Password must include at least one special character
            (e.g., ! @ # $ % ^ & * ( ) _ + - = [ ] { } ; : ' \" , < > . ? / ` ~).
            """,
        )

    if len(errors) > 0:
        raise ValidationError(", ".join(errors))


class CustomPasswordValidator:
    def validate(self, password, user=None):  # noqa
        validate_password(password)

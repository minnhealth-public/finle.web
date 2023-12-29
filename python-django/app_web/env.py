import logging
from os import environ
from typing import List, Tuple

from attr import attrib, attrs

logger = logging.getLogger(__name__)

# TODO: -MGH- Consider an exporter that can generate an example .env file


@attrs
class EnvValue:
    key: str = attrib()
    use_hint: str = attrib()
    default: str = attrib()
    allowed_values: List[str] = attrib()


__ENV_MANIFEST = [
    EnvValue(
        key="ENV_FILE_OK",
        use_hint=".env file must set this value to 1",
        default="",
        allowed_values=["0", "1"],
    ),
    EnvValue(
        key="ALLOWED_HOSTS",
        use_hint="Specifies the allowed hosts for the app",
        default="",
        allowed_values=[],
    ),
    EnvValue(
        key="CORS_ALLOW_ALL_ORIGINS",
        use_hint="Boolean to allow all origins; not for production",
        default="False",
        allowed_values=["False", "True"],
    ),
    EnvValue(
        key="CORS_ALLOWED_ORIGINS",
        use_hint="Specifies the allowed origins for the app",
        default="http://localhost:8000",
        allowed_values=[],
    ),
    EnvValue(
        key="API_HOST",
        use_hint="Specifies the URL of the API's host",
        default="http://localhost:8000",
        allowed_values=[],
    ),
    EnvValue(
        key="DEBUG",
        use_hint="Django debug on/off",
        default="False",
        allowed_values=["False", "True"],
    ),
    EnvValue(
        key="POSTGRES_HOST",
        use_hint="Postgres DB host",
        default="finle-db-postgres",
        allowed_values=[],
    ),
    EnvValue(
        key="POSTGRES_NAME",
        use_hint="Postgres DB name",
        default="postgres",
        allowed_values=[],
    ),
    EnvValue(
        key="POSTGRES_PASSWORD",
        use_hint="Postgres password",
        default="",
        allowed_values=[],
    ),
    EnvValue(
        key="POSTGRES_USER",
        use_hint="Postgres user name",
        default="postgres",
        allowed_values=[],
    ),
    EnvValue(
        key="SECRET_KEY",
        use_hint="Django secret for the backend app",
        default="",
        allowed_values=[],
    ),
    EnvValue(
        key="SENTRY_URI",
        use_hint="Sentry URI for reporting application errors in production",
        default="invalid-uri",
        allowed_values=[],
    ),
]


def env_manifest() -> Tuple[EnvValue, ...]:
    return tuple(value for value in __ENV_MANIFEST)


def env_get(key: str) -> [None, EnvValue]:
    for env_value in __ENV_MANIFEST:
        if key == env_value.key:
            return env_value
    else:
        logger.warning("Environment variable %s requested and not found", key)
        return None


def env_get_raw_value(key: str) -> [None, str]:
    env_obj = env_get(key)
    if env_obj is not None:
        rtn = environ.get(env_obj.key, None)
        if rtn is None:
            if not env_obj.default:
                raise OSError(
                    f"The env file for this environment does not have a value for {key} and "
                    f"this value is required.",
                )
            else:
                rtn = env_obj.default
        # else:
        #     print(f"env lookup: {key} -> {rtn}")
        return rtn


def _comma_separated_strings_to_list(input_str) -> List[str]:
    if input_str.find(",") == -1:
        rtn = [
            input_str,
        ]
    else:
        # Split on commas and remove empties
        rtn = input_str.split(",")
        rtn = list(filter(None, rtn))

    return rtn


def env_get_allowed_hosts() -> List[str]:
    """Assemble a tuple of allowed hosts from the raw environment variable string."""
    # Note: the raw list is expected to be a comma-separated string but may be only one value
    raw_value = env_get_raw_value("ALLOWED_HOSTS")
    return _comma_separated_strings_to_list(raw_value)


def env_get_allowed_origins() -> List[str]:
    """Assemble a tuple of allowed origins from the raw environment variable string."""
    # Note: the raw list is expected to be a comma-separated string but may be only one value
    raw_value = env_get_raw_value("CORS_ALLOWED_ORIGINS")
    return _comma_separated_strings_to_list(raw_value)


def validate_env():
    # An .env file use is required
    env_ok_value = env_get_raw_value("ENV_FILE_OK")
    env_ok_allowed_values = ("1", True, "True")
    if env_ok_value not in env_ok_allowed_values:
        raise OSError(f"ENV_FILE_OK={env_ok_value} must be in {env_ok_allowed_values}")

    for env_obj in __ENV_MANIFEST:
        # Environment value must exist in the environment
        env_value = env_get_raw_value(env_obj.key)
        # print(f"Validating: {env_obj.key} -> {env_value}")

        # Environment value must be in the allowed values if allowed values are specified
        if len(env_obj.allowed_values) > 0 and env_value not in env_obj.allowed_values:
            raise OSError(f"{env_obj.key}={env_value} must be in {env_obj.allowed_values}")


# Note: Calling the validator here will validate the env file whenever this module used by the application
validate_env()

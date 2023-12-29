import pytest

from app_web.env import (
    _comma_separated_strings_to_list,
    env_get_raw_value,
    validate_env,
)


class TestEnv:
    def test_validator(self):
        rtn = validate_env()
        assert rtn is None

    def test_env_from_file(self):
        assert env_get_raw_value("ENV_FILE_OK") in ("1", 1, True)

    @pytest.mark.parametrize(
        "input_str,expected_result",
        (
            (
                "https://only_one_host:8000",
                [
                    "https://only_one_host:8000",
                ],
            ),
            (
                "https://first_host:8000,https://second_host:3000",
                ["https://first_host:8000", "https://second_host:3000"],
            ),
            ("first,second,third", ["first", "second", "third"]),
            ("first,second,third,", ["first", "second", "third"]),
            (",,first,second,third,", ["first", "second", "third"]),
        ),
    )
    def test_comma_separated_string_to_list(self, input_str, expected_result):
        assert _comma_separated_strings_to_list(input_str) == expected_result

from datetime import timedelta, datetime
from typing import Optional


def parse_string(value: any) -> Optional[str]:
    return value if isinstance(value, str) and len(value) > 0 else None


def parse_integer(value: any) -> Optional[int]:
    try:
        return int(float(value) + 0.5) if isinstance(value, str) and len(value) > 0 else None
    except ValueError:
        return None


def parse_float(value: any) -> Optional[float]:
    try:
        return float(value) if isinstance(value, str) and len(value) > 0 else None
    except ValueError:
        return None


def parse_duration(value: any) -> Optional[timedelta]:
    try:
        time = datetime.strptime(value, "%H:%M:%S")
        return timedelta(hours=time.hour, minutes=time.minute, seconds=time.second)
    except TypeError:
        return None
    except ValueError:
        return None

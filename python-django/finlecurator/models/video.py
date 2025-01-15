from datetime import timedelta
from enum import Enum
from typing import List, Tuple, Dict, Optional

from pandas import DataFrame

from finlecurator.models.clip import Clip, ClipType
from finlecurator.models.model import Model, Sheet
from finlecurator.models.utils import parse_string, parse_integer, parse_duration


class VideoQuality(Enum):
    POOR = 1
    GOOD = 2
    EXCELLENT = 3

    @classmethod
    def create(cls, value: any) -> Optional["VideoQuality"]:
        try:
            return VideoQuality[str(value).upper().strip()]
        except AttributeError:
            return None
        except KeyError:
            return None


class Video(Model):
    ZERO_DURATION = timedelta(seconds=0)

    def __init__(
        self,
        sheet: Sheet,
        row: int,
        name: Optional[str],
        description: Optional[str],
        streaming_service: Optional[str],
        video_id: Optional[str],
        duration: Optional[timedelta],
        production_year: Optional[int],
        video_quality: Optional[VideoQuality],
    ):
        super().__init__(sheet=sheet, row=row, name=name if not None else "")
        self._description: Optional[str] = description
        self._streaming_service: Optional[str] = streaming_service
        self._video_id: Optional[str] = video_id
        self._duration: Optional[timedelta] = duration
        self._production_year: Optional[int] = production_year
        self._video_quality: Optional[VideoQuality] = video_quality
        self._clips: Dict[str, Clip] = {}

    def __str__(self):
        return f"{self.name} ({self.streaming_service}:{self.video_id}) [{self.duration}]"

    @property
    def description(self) -> Optional[str]:
        return self._description

    @property
    def streaming_service(self) -> Optional[str]:
        return self._streaming_service

    @property
    def video_id(self) -> Optional[str]:
        return self._video_id

    @property
    def duration(self) -> Optional[timedelta]:
        return self._duration

    @property
    def production_year(self) -> Optional[int]:
        return self._production_year

    @property
    def video_quality(self) -> Optional[VideoQuality]:
        return self._video_quality

    @property
    def clips(self) -> List[Clip]:
        return sorted(
            list(self._clips.values()),
            key=lambda c: (
                c.start if c.start is not None else Video.ZERO_DURATION,
                c.name if c.name is not None else "",
            ),
        )

    def get_clip(self, name: str) -> Optional[Clip]:
        return self._clips.get(name)

    def add_clip(self, key: str, clip: Clip):
        self._clips[key] = clip

    def clips_by_type(self) -> Tuple[List[Clip], List[Clip], List[Clip]]:
        d = {
            t: sorted([c for c in self.clips if c.clip_type == t and c.start is not None], key=lambda c: c.start)
            for t in ClipType
        }
        return d[ClipType.SHORT], d[ClipType.MEDIUM], d[ClipType.LONG]

    @classmethod
    def create(cls, sheet: Sheet, df: DataFrame, index: int) -> Optional["Video"]:
        name = parse_string(df["Video Name"][index])
        description = parse_string(df["Video Description"][index])
        streaming_service = cls.__parse_streaming_service(df["Video URL"][index])
        video_id = cls.__parse_video_id(df["Video URL"][index]) if not df["Video Id"][index] else df["Video Id"][index]
        duration = parse_duration(df["Video Duration"][index])
        production_year = parse_integer(df["Video Production Year"][index])
        video_quality = VideoQuality.create(df["Video Quality"][index])
        if (
            name is not None
            or description is not None
            or streaming_service is not None
            or video_id is not None
            or duration is not None
            or production_year is not None
            or video_quality is not None
        ):
            return Video(
                sheet,
                index + 2,
                name,
                description,
                streaming_service,
                video_id,
                duration,
                production_year,
                video_quality,
            )
        return None

    @classmethod
    def __parse_streaming_service(cls, url: any) -> Optional[str]:
        # Note: Cannot reliably read the 'Video Streaming Service' cell since it calls a Javascript function.
        if isinstance(url, str) and len(url) > 0:
            upper_url = url.upper()
            if "YOUTUBE.COM" in upper_url or "YOUTU.BE" in upper_url:
                return "YouTube"
        return None

    @classmethod
    def __parse_video_id(cls, url: any) -> Optional[str]:
        # Note: Cannot reliably read the 'Video Id' cell since it calls a Javascript function.
        if isinstance(url, str) and len(url) > 0:
            upper_url = url.upper()
            index_youtube_1 = upper_url.find("YOUTUBE.COM")
            index_youtube_2 = upper_url.find("YOUTU.BE")
            if index_youtube_1 >= 0:
                index1a = upper_url.find("?V=")
                index1b = upper_url.find("&V=")
                if index1a < 0 and index1b < 0:
                    return None
                index1 = index1a + 3 if index1a > 0 else index1b + 3
                index2 = upper_url.find("&", index1)
                return url[index1:index2] if index2 >= 0 else url[index1:]
            elif index_youtube_2 >= 0:
                index1 = upper_url.find("/", index_youtube_2) + 1
                if index1 == 0 or index1 == len(upper_url):
                    return None
                index2 = upper_url.find("?", index1)
                return url[index1:index2] if index2 >= 0 else url[index1:]
        return None

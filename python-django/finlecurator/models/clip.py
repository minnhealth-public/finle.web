import re
from datetime import timedelta
from enum import Enum
from typing import List, Tuple, Optional

from pandas import DataFrame

from finlecurator.models.model import Sheet, Model
from finlecurator.models.utils import parse_float, parse_string, parse_duration


class ClipType(Enum):
    LONG = 1
    MEDIUM = 2
    SHORT = 3

    @classmethod
    def create(cls, value: any) -> Optional["ClipType"]:
        try:
            return ClipType[str(value).upper().strip()]
        except AttributeError:
            return None
        except KeyError:
            return None


class Clip(Model):
    def __init__(
        self,
        sheet: Sheet,
        row: int,
        name: Optional[str],
        speaker: Optional[str],
        clip_type: Optional[ClipType],
        start: Optional[timedelta],
        end: Optional[timedelta],
        motivational: Optional[bool],
        instructional: Optional[bool],
        relevancy: Optional[float],
        tags: Optional[List[str]],
        takeaways: Optional[List[str]],
    ):
        super().__init__(sheet=sheet, row=row, name=name if not None else "")
        self._speaker: Optional[str] = speaker
        self._clip_type: Optional[ClipType] = clip_type
        self._start: Optional[timedelta] = start
        self._end: Optional[timedelta] = end
        self._motivational: Optional[bool] = motivational
        self._instructional: Optional[bool] = instructional
        self._relevancy: Optional[float] = relevancy
        self._tags: Optional[List[str]] = tags
        self._takeaways: Optional[List[str]] = takeaways

    def __str__(self):
        return f"{self.name} ({self._clip_type}) [{self._start} - {self._end}]"

    @property
    def speaker(self) -> Optional[str]:
        return self._speaker

    @property
    def clip_type(self) -> Optional[ClipType]:
        return self._clip_type

    @property
    def start(self) -> Optional[timedelta]:
        return self._start

    @property
    def end(self) -> Optional[timedelta]:
        return self._end

    @property
    def instructional(self) -> Optional[bool]:
        return self._instructional

    @property
    def motivational(self) -> Optional[bool]:
        return self._motivational

    @property
    def relevancy(self) -> Optional[float]:
        return self._relevancy

    @property
    def tags(self) -> Optional[List[str]]:
        return self._tags

    @property
    def takeaways(self) -> Optional[List[str]]:
        return self._takeaways

    def add_tags(self, tags: List[str]) -> None:
        self._tags.extend(tags)

    def add_takeaways(self, takeaways: List[str]) -> None:
        self._takeaways.extend(takeaways)

    @classmethod
    def create(cls, sheet: Sheet, df: DataFrame, index: int) -> Optional["Clip"]:
        name = parse_string(df["Clip Name"][index])
        speaker = parse_string(df["Clip Speaker"][index])
        clip_type = ClipType.create(df["Clip Type"][index])
        start = parse_duration(df["Clip Start Time"][index])
        end = parse_duration(df["Clip End Time"][index])
        motivational, instructional = cls.__parse_clip_purpose(df["Clip Purpose"][index])
        relevancy = parse_float(df["Clip Relevancy"][index])
        tags = cls.__parse_string_list(df["Clip Tags"][index])
        takeaways = cls.__parse_string_list(df["Clip Takeaways"][index])
        if (
            name is not None
            or speaker is not None
            or clip_type is not None
            or start is not None
            or end is not None
            or motivational is not None
            or instructional is not None
            or relevancy is not None
            or tags is not None
            or takeaways is not None
        ):
            return Clip(
                sheet, index + 2, name, speaker, clip_type, start, end, motivational, instructional, relevancy, tags,
                takeaways
            )
        return None

    @classmethod
    def __parse_clip_purpose(cls, value: any) -> Tuple[Optional[bool], Optional[bool]]:
        try:
            tokens = list(filter(None, re.split(" |&", value.upper())))
            if len(tokens) == 0:
                return None, None

            motivational = False
            instructional = False
            for token in tokens:
                if token == "MOTIVATIONAL":
                    motivational = True
                elif token == "INSTRUCTIONAL":
                    instructional = True
                else:
                    return None, None

            return motivational, instructional
        except AttributeError:
            return None, None

    @classmethod
    def __parse_string_list(cls, value: any) -> Optional[List[str]]:
        try:
            return list(filter(None, re.split("\r|\n", value)))
        except AttributeError:
            return None

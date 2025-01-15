from typing import Dict, List, Optional

from pandas import DataFrame

from finlecurator.models.model import Sheet, Model
from finlecurator.models.utils import parse_string
from finlecurator.models.video import Video


class Channel(Model):
    def __init__(self, sheet: Sheet, row: int, name: str, description: Optional[str], website: Optional[str]):
        super().__init__(sheet=sheet, row=row, name=name)
        self._description: Optional[str] = description
        self._website: Optional[str] = website
        self._videos: Dict[str, Video] = {}

    def __str__(self):
        return f"{self.name}"

    @property
    def description(self) -> Optional[str]:
        return self._description

    @property
    def website(self) -> Optional[str]:
        return self._website

    @property
    def videos(self) -> List[Video]:
        return sorted(list(self._videos.values()), key=lambda v: v.name if v.name is not None else "")

    def get_video(self, video_id: str) -> Optional[Video]:
        return self._videos.get(video_id)

    def add_video(self, key: str, video: Video):
        self._videos[key] = video

    @classmethod
    def create(cls, sheet: Sheet, df: DataFrame, index: int) -> Optional["Channel"]:
        name = parse_string(df["Channel Name"][index])
        description = parse_string(df["Channel Description"][index])
        website = parse_string(df["Channel Website"][index])
        if name is not None or description is not None or website is not None:
            return Channel(sheet, index + 2, name, description, website)
        return None

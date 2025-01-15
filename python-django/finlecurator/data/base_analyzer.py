from abc import ABC, abstractmethod
from typing import Dict, Optional, Tuple
import os
from datetime import datetime

import pandas as pd
from pandas import DataFrame
from pytz import timezone
from django.http import HttpResponse

from io import BytesIO

from finlecurator.data.validator import Validator
from finlecurator.models.channel import Channel
from finlecurator.models.clip import Clip
from finlecurator.models.model import Sheet
from finlecurator.models.video import Video


class BaseAnalyzer(ABC):
    def __init__(self):
        self._dataframes: Dict[Sheet, DataFrame] = {}
        self._channels: Dict[str, Channel] = {}
        self._videos: Dict[str, Video] = {}
        self._clips: Dict[str, Clip] = {}
        self._keyless_channels = 0
        self._keyless_videos = 0
        self._keyless_clips = 0

    def _get_channel(self, key: str) -> Optional[Channel]:
        return self._channels.get(key) if key is not None else None

    def _add_channel(self, key: Optional[str], channel: Channel) -> None:
        if key is None:
            self._keyless_channels += 1
            key = f"__@!KEYLESS_CHANNEL_{self._keyless_channels:07d}!@__"
        self._channels[key] = channel

    def _get_video(self, key: str) -> Optional[Video]:
        return self._videos.get(key) if key is not None else None

    def _add_video(self, key: Optional[str], video: Video) -> None:
        if key is None:
            self._keyless_videos += 1
            key = f"__@!KEYLESS_VIDEO_{self._keyless_videos:07d}!@__"
        self._videos[key] = video

    def _get_clip(self, key: Optional[str]) -> Optional[Clip]:
        return self._clips.get(key) if key is not None else None

    def _add_clip(self, key: Optional[str], clip: Clip) -> None:
        if key is None:
            self._keyless_clips += 1
            key = f"__@!KEYLESS_CLIP_{self._keyless_clips:07d}!@__"
        self._clips[key] = clip

    def get_dataframes(self) -> Dict[Sheet, DataFrame]:
        return self._dataframes

    def get_channels(self) -> Dict[str, Channel]:
        return self._channels

    def get_channel(self, key: str) -> Optional[Channel]:
        return self._get_channel(key)

    def get_video(self, key: str) -> Optional[Video]:
        return self._get_video(key)

    def get_clip(self, key: Optional[str]) -> Optional[Clip]:
        return self._get_clip(key)

    def get_report_time(self, filepath: str, zone: timezone) -> str:
        timestamp = os.path.getmtime(filepath)
        date_time = datetime.fromtimestamp(timestamp)
        return date_time.astimezone(zone).strftime("%m/%d/%Y %I:%M:%S %p")

    def analyze_video_data(self) -> Optional[Dict[str, Channel]]:
        if not self._dataframes:
            return None
        else:
            self._channels.clear()
            self._videos.clear()
            self._clips.clear()
            self._keyless_channels = 0
            self._keyless_videos = 0
            self._keyless_clips = 0
            for sheet, df in self._dataframes.items():
                self.parse_video_data(sheet, df)
            Validator.validate_after_parsing(self._channels)
            return self._channels

    def parse_video_data(self, sheet: Sheet, df: DataFrame) -> None:
        current_video = None
        current_channel = None
        for index in range(len(df.index)):
            channel = Channel.create(sheet, df, index)
            if channel is not None:
                channel_key = channel.name.upper() if channel.name is not None else None
                current_channel = self._get_channel(channel_key)
                Validator.validate_channel_during_parsing(channel, current_channel)
                if current_channel is not None:
                    current_channel.add_source_ref(channel.source_refs[0])
                else:
                    current_channel = channel
                    self._add_channel(channel_key, channel)

            video = Video.create(sheet, df, index)
            if current_channel is not None and video is not None:
                video_key = video.video_id
                Validator.validate_video_during_parsing(video, self._get_video(video_key))
                current_video = current_channel.get_video(video_key)
                if current_video is not None:
                    current_video.add_source_ref(video.source_refs[0])
                else:
                    current_video = video
                    current_channel.add_video(video_key, video)
                    self._add_video(video_key, video)

            clip = Clip.create(sheet, df, index)
            if current_video is not None and clip is not None:
                clip_type = str(clip.clip_type) if clip.clip_type is not None else "UNSPECIFIED"
                clip_speaker = clip.speaker if clip.speaker is not None else "UNSPECIFIED"
                clip_key = "[" + clip_type + "] " + clip.name.upper() + f"[{clip_speaker}]" \
                    if clip.name is not None else None
                Validator.validate_clip_during_parsing(clip, self._get_clip(clip_key))
                current_clip = current_video.get_clip(clip_key)
                if current_clip is not None:
                    current_clip.add_source_ref(clip.source_refs[0])
                    current_clip.add_tags(clip.tags)
                    current_clip.add_takeaways(clip.takeaways)
                else:
                    current_video.add_clip(clip_key, clip)
                    self._add_clip(clip_key, clip)

    @abstractmethod
    def fetch_video_data(self, refresh: bool = True) -> Tuple[bool, Optional[str]]:
        pass

    def create_excel_file(self, filename):
        with BytesIO() as buffer:
            with pd.ExcelWriter(buffer, engine='xlsxwriter') as writer:
                for sheet, df in self._dataframes.items():
                    if df.empty:
                        print(f"Skipping empty sheet: {sheet.title()}")
                        continue
                    df.to_excel(writer, sheet_name=sheet.title(), index=False)

            buffer.seek(0)

            response = HttpResponse(buffer.getvalue(),
                                    content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
            response['Content-Disposition'] = f'attachment; filename={filename}'
            return response

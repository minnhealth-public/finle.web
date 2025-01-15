import os
import pickle
from typing import Optional, Tuple

import pandas as pd
from pandas import DataFrame

from finlecurator.data.base_analyzer import BaseAnalyzer
from finlecurator.models.model import Sheet
from finlecurator import data as fc_data
from app_web.models import Topic, ClipAddressedTopic
from app_web.models import Clip as DBClip


class DBAnalyzer(BaseAnalyzer):
    PICKLE_FILE = os.path.join(os.path.dirname(fc_data.__file__), "_db.dataframes.pkl")

    def __init__(self):
        super().__init__()

    def fetch_video_data(self, refresh: bool = True) -> Tuple[bool, Optional[str]]:
        success = True
        error_message = None
        self._dataframes.clear()

        if not refresh and os.path.isfile(DBAnalyzer.PICKLE_FILE):
            try:
                with open(DBAnalyzer.PICKLE_FILE, "rb") as file:
                    self._dataframes = pickle.load(file)
                    return True, None
            except pickle.PickleError:
                error_message = f'Warning: Could not open "{DBAnalyzer.PICKLE_FILE}".'

        try:
            self._dataframes = {}
            for topic in Topic.objects.all():
                try:
                    df = self.__get_topic_as_dataframe(topic)
                    sheet = Sheet.find_by_title(topic.name)
                    self._dataframes[sheet] = df
                except Exception as e:
                    success = False
                    error_message = str(e)
                    break
            if success:
                with open(self.PICKLE_FILE, "wb") as file:
                    pickle.dump(self._dataframes, file, protocol=pickle.HIGHEST_PROTOCOL)
        except Exception as e:
            success = False
            error_message = str(e)

        return success, error_message

    @classmethod
    def __get_topic_as_dataframe(cls, topic: Topic) -> DataFrame:
        clips = DBClip.objects.filter(topics_addressed=topic).select_related('video__channel')

        headers = ['Channel Name', 'Channel Description', 'Channel Website', 'Video Name', 'Video Description',
                   'Video URL', 'Video Streaming Service', 'Video Id', 'Video Duration', 'Video Production Year',
                   'Video Quality', 'Clip Name', 'Clip Speaker', 'Clip Type', 'Clip Start Time', 'Clip End Time',
                   'Clip Duration', 'Clip Purpose', 'Clip Relevancy', 'Clip Tags', 'Clip Takeaways']
        data = []

        for clip in clips:
            # Get clip addressed topic details
            clip_addressed_topic = ClipAddressedTopic.objects.filter(clip=clip, topic=topic).first()
            purpose = ''
            relevancy = ''
            if clip_addressed_topic:
                motivational = clip_addressed_topic.motivational
                instructional = clip_addressed_topic.instructional
                relevancy = str(clip_addressed_topic.relevancy)

                purpose_tokens = []
                if motivational:
                    purpose_tokens.append("MOTIVATIONAL")
                if instructional:
                    purpose_tokens.append("INSTRUCTIONAL")
                purpose = " & ".join(purpose_tokens)

            # If channel exists in spreadsheet, don't add to row
            channel_name, channel_desc = get_channel_details(data, clip.video.channel)

            # If video exists in spreadsheet, don't add to row
            video_name, video_desc, video_url, video_service, video_id, video_dur, video_year, video_qual = \
                get_video_details(data, clip.video)

            row = [
                channel_name,
                channel_desc,
                '',  # channel url
                video_name,
                video_desc,
                video_url,
                video_service,
                video_id,
                video_dur,
                video_year,
                video_qual,
                clip.name,
                clip.speaker,
                clip.type,
                str(clip.start_time),
                str(clip.end_time),
                str(clip.end_time - clip.start_time),
                purpose,
                relevancy,
                '\n'.join(tag.name for tag in clip.tags.all()),
                '\n'.join(takeaway.text for takeaway in clip.key_takeaways.all())
            ]
            data.append(row)

        df = pd.DataFrame(data, columns=headers)
        return df


def get_channel_details(data, channel):
    channel_exists = any(row[0] == channel.name for row in data)

    if not channel_exists:
        return channel.name, channel.description

    return '', ''


def get_video_details(data, video):
    video_exists = any(row[7] == video.video_id for row in data)

    if not video_exists:
        video_duration = DBClip.objects.filter(video=video) \
            .order_by('-end_time').values_list('end_time', flat=True).first()

        return video.name, video.description, video.url, video.streaming_service, video.video_id, str(video_duration), \
            str(video.production_year), video.quality

    return '', '', '', '', '', '', '', ''

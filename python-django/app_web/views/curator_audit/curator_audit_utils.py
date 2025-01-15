import json
from logging import INFO, getLogger
from django.utils.dateparse import parse_duration
from app_web.models import Channel, Video, Clip, ClipAddressedTopic, Topic, Tag, KeyTakeaway

LOGGER = getLogger(__name__)
LOGGER.setLevel(INFO)


def is_channel_valid(channel):
    if channel is None or len(channel.violations) > 0:
        return False
    elif not len([video for video in channel.videos if is_video_valid(video)]) > 0:
        return False
    return True


def is_video_valid(video):
    if video is None or len(video.violations) > 0:
        return False
    elif not len([clip for clip in video.clips if is_clip_valid(clip)]) > 0:
        return False
    return True


def is_clip_valid(clip):
    if clip is None or len(clip.violations) > 0:
        return False
    return True


def get_missing_item_details(item):
    if item is None:
        return 'Item does not exist in this source.'
    elif len(item.violations) > 0:
        violations = ''
        for violation in item.violations:
            violations += violation.message + '<br/>'
        return f'<strong>Item has violations</strong>: {violations}'


def lists_are_equal(list1, list2):
    return sorted(list1) == sorted(list2)


def add_channel(details):
    LOGGER.info(f"Adding channel: {details.get('name')}")

    channel, created = Channel.objects.get_or_create(name=details.get('name'), description=details.get('description'))
    channel.save()
    add_videos_to_channel(details.get('videos'))


def update_channel(details):
    LOGGER.info(f"Updating channel: {details.get('name')}")

    Channel.objects.filter(name=details.get('name')).update(description=details.get('description'))


def add_video(details):
    LOGGER.info(f"Adding video: {details.get('name')}")

    video, created = Video.objects.get_or_create(
        name=details.get('name'),
        description=details.get('description'),
        streaming_service=Video.StreamingService[details.get('streaming_service').upper()],
        video_id=details.get('video_id'),
        channel=Channel.objects.get(name__iexact=details.get('channel')),
        quality=Video.Quality[details.get('quality')],
        production_year=details.get('production_year')
    )
    video.save()
    add_clips_to_video(details.get('clips'))


def update_video(details):
    LOGGER.info(f"Updating video: {details.get('video_id')}")

    Video.objects.filter(video_id=details.get('video_id')).update(
        name=details.get('name'),
        description=details.get('description'),
        streaming_service=Video.StreamingService[details.get('streaming_service').upper()],
        quality=Video.Quality[details.get('quality')],
        production_year=details.get('production_year')
    )


def add_videos_to_channel(channel_videos):
    for channel_video in channel_videos:
        add_video(channel_video)


def add_clips_to_video(video_clips):
    for video_clip in video_clips:
        add_clip(video_clip)


def add_clip(details):
    LOGGER.info(f"Adding clip: {details.get('name')}")

    if details.get('parent') == '':
        parent = None
    else:
        LOGGER.info(f"Finding parent: {details.get('parent')}")
        parent = Clip.objects.get(name__iexact=details.get('parent'))

    clip, created = Clip.objects.get_or_create(
        name=details.get('name'),
        video=Video.objects.get(video_id=details.get('video_id')),
        speaker=details.get('speaker'),
        type=Clip.ClipType[details.get('type')],
        start_time=parse_duration(details.get('start_time')),
        end_time=parse_duration(details.get('end_time')),
        parent=parent
    )
    clip.save()
    add_clip_related_data(clip, details)


def update_clip(details):
    LOGGER.info(f"Updating clip: {details.get('name')}")

    Clip.objects.filter(name=details.get('name')).update(
        speaker=details.get('speaker'),
        type=Clip.ClipType[details.get('type')],
        start_time=parse_duration(details.get('start_time')),
        end_time=parse_duration(details.get('end_time')),
    )
    clip = Clip.objects.get(name=details.get('name'))
    add_clip_related_data(clip, details)


def add_clip_related_data(clip, clip_details):
    add_topics_to_clip(clip, clip_details.get('topics'), clip_details)
    add_tags_to_clip(clip, clip_details.get('tags'), clip_details)
    add_takeaways_to_clip(clip, clip_details.get('key_takeaways'))


def add_topics_to_clip(clip, topics_str, clip_details):
    topics_arr = topics_str.split()
    for topic_name in topics_arr:
        clip_addressed_topic, created = ClipAddressedTopic.objects.get_or_create(
            clip=clip,
            topic=Topic.objects.get(name__iexact=topic_name),
            motivational=clip_details.get('motivational'),
            instructional=clip_details.get('instructional'),
            relevancy=clip_details.get('relevancy')
        )
        clip_addressed_topic.save()


def add_tags_to_clip(clip, tags_str_arr, clip_details):
    topics_arr = clip_details.get('topics').split()
    tag_list_for_clip = []
    for tag_str in tags_str_arr:
        LOGGER.info(f"Adding tag: {tag_str}")
        if ":" in tag_str:
            tag_arr = tag_str.split(":")
            tag_name = tag_arr[1]
            tag_topic = tag_arr[0]
        else:
            tag_name = tag_str
            tag_topic = topics_arr[0]  # Assign first topic in topics_arr if not provided

        tag, created = Tag.objects.get_or_create(
            name=tag_name,
            category=Topic.objects.get(name__iexact=tag_topic)
        )
        tag.save()
        tag_list_for_clip.append(tag)
    clip.tags.set(tag_list_for_clip)
    clip.save()


def add_takeaways_to_clip(clip, takeaways):
    takeaway_list_for_clip = []
    for takeaway_text in takeaways:
        takeaway, created = KeyTakeaway.objects.get_or_create(
            text=takeaway_text
        )
        takeaway.save()
        takeaway_list_for_clip.append(takeaway)
    clip.key_takeaways.set(takeaway_list_for_clip)
    clip.save()


def fetch_dataframes(sheets_analyzer, db_analyzer, load_db, load_sheet):
    success, error_message = sheets_analyzer.fetch_video_data(refresh=load_sheet)
    success, error_message = db_analyzer.fetch_video_data(refresh=load_db)
    sheets_channels = sheets_analyzer.analyze_video_data()
    db_channels = db_analyzer.analyze_video_data()
    return db_channels, sheets_channels


def get_channel_details(channel, include_videos=False):
    result = f"<strong>Channel name</strong>: {channel.name}</br>" \
             f"<strong>Channel description</strong>: {channel.description}</br>"

    if include_videos:
        videos_name_list = ', '.join(
            [video.name for video in channel.videos if video.name is not None and is_video_valid(video)])
        result += f"<strong>Videos</strong>: {videos_name_list}"

    return result


def get_channel_json(channel, include_videos=False):
    channel_json = {"name": channel.name,
                    "description": channel.description,
                    "source_refs": get_source_refs_for_json(channel.source_refs)}

    if include_videos:
        videos_json = []
        for video in channel.videos:
            if not len(video.violations) > 0:
                video_json = json.loads(get_video_json(channel.name, video, include_clips=True))
                videos_json.append(video_json)
        channel_json['videos'] = videos_json

    return json.dumps(channel_json)


def get_video_details(channel_name, video, include_clips=False):
    result = f"<strong>Channel name</strong>: {channel_name}</br>" \
             f"<strong>Video id</strong>: {video.video_id}</br>" \
             f"<strong>Video name</strong>: {video.name}</br>" \
             f"<strong>Video description</strong>: {video.description}</br>" \
             f"<strong>Video streaming service</strong>: {video.streaming_service}</br>" \
             f"<strong>Video quality</strong>: {video.video_quality and video.video_quality.name}</br>" \
             f"<strong>Video production year</strong>: {video.production_year}</br>"

    if include_clips:
        clips_name_list = ', '.join([clip.name for clip in video.clips if clip.name is not None])
        result += f"<strong>Clips</strong>: {clips_name_list}"

    return result


def get_video_json(channel_name, video, include_clips=False):
    sorted_clips = sort_clips(video.clips)

    video_json = {"name": video.name,
                  "description": video.description,
                  "streaming_service": video.streaming_service,
                  "video_id": video.video_id,
                  "channel": channel_name,
                  "quality": video.video_quality and video.video_quality.name,
                  "production_year": video.production_year,
                  "source_refs": get_source_refs_for_json(video.source_refs),
                  "duration": str(sorted_clips[0].end if sorted_clips[0] is not None else '')
                  }

    if include_clips:
        clips_json = []

        for index, clip in enumerate(sorted_clips):
            if not len(clip.violations) > 0:
                clip_json = json.loads(get_clip_json(video, clip))
                clips_json.append(clip_json)
        video_json['clips'] = clips_json

    return json.dumps(video_json)


def find_parent_video(clip, clip_index, all_clips):
    def find_parent(start_index, target_clip_type):
        idx = start_index - 1
        while idx >= 0 and str(all_clips[idx].clip_type.name) != target_clip_type:
            idx -= 1
        return all_clips[idx].name if idx >= 0 else ''

    clip_type = str(clip.clip_type.name)

    if clip_type == 'LONG' or clip_index == 0:
        return ''

    if clip_type == 'MEDIUM':
        return find_parent(clip_index, 'LONG')

    if clip_type == 'SHORT':
        return find_parent(clip_index, 'MEDIUM')

    return ''


def get_clip_details(channel_name, clip):
    return f"<strong>Channel name</strong>: {channel_name}</br>" \
           f"<strong>Clip name</strong>: {clip.name}</br>" \
           f"<strong>Clip speaker</strong>: {clip.speaker}</br>" \
           f"<strong>Clip type</strong>: {clip.clip_type}</br>" \
           f"<strong>Clip start</strong>: {clip.start}</br>" \
           f"<strong>Clip end</strong>: {clip.end}</br>" \
           f"<strong>Clip topics</strong>: {clip.sheets}</br>" \
           f"<strong>Clip motivational</strong>: {clip.motivational}</br>" \
           f"<strong>Clip instructional</strong>: {clip.instructional}</br>" \
           f"<strong>Clip relevancy</strong>: {clip.relevancy}</br>" \
           f"<strong>Clip tags</strong>: {clip.tags}</br>" \
           f"<strong>Clip takeaways</strong>: {clip.takeaways}</br>"


def get_clip_json(video, clip):
    clip_index = next((i for i, c in enumerate(video.clips) if c.name == clip.name), None)
    parent_clip_name = None
    if clip_index is not None:
        parent_clip_name = find_parent_video(clip, clip_index, video.clips)

    return json.dumps({"name": clip.name,
                       "video_id": video.video_id,
                       "parent": parent_clip_name,
                       "speaker": clip.speaker,
                       "type": clip.clip_type.name,
                       "start_time": str(clip.start),
                       "end_time": str(clip.end),
                       "topics": clip.sheets,
                       "motivational": clip.motivational,
                       "instructional": clip.instructional,
                       "relevancy": clip.relevancy,
                       "tags": clip.tags,
                       "key_takeaways": clip.takeaways,
                       "source_refs": get_source_refs_for_json(clip.source_refs)})


def get_source_refs_for_json(source_refs):
    refs = []
    for ref in source_refs:
        refs.append({"sheet": ref.sheet.title(), "row": ref.row})
    return refs


def sort_clips(clips):
    type_order = {'LONG': 0, 'MEDIUM': 1, 'SHORT': 2}
    sorted_clips = sorted(clips, key=lambda c: (c.start, type_order[c.clip_type.name]))
    return sorted_clips

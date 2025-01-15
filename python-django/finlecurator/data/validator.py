from datetime import timedelta
from typing import Dict, Tuple, Optional, List, NamedTuple
from urllib.parse import urlparse

from finlecurator.models.channel import Channel
from finlecurator.models.clip import Clip, ClipType
from finlecurator.models.model import Severity
from finlecurator.models.video import Video


class ChildAndParent(NamedTuple):
    child: Clip
    parent: Optional[Clip]


class Validator:
    ZERO_SECONDS = timedelta(seconds=0)
    ALLOWED_OVERLAP = timedelta(seconds=5)
    MAX_SHORT_CLIP_DURATION = timedelta(seconds=90)

    @classmethod
    def validate_channel_during_parsing(cls, current: Channel, existing: Optional[Channel]) -> None:
        current_ref = current.source_refs[0]
        if existing is not None:
            for existing_ref in existing.source_refs:
                # Rule 100: A channel, defined by its name, must not appear more than once per sheet.
                if existing_ref.sheet == current_ref.sheet:
                    current.add_violation(
                        code="100",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message=f"The channel is already defined in row {existing_ref.row}.",
                    )
                # Rule 101: A channel, defined by its name, that appears on multiple sheets must have the same
                #           description and website.
                elif current.description != existing.description or current.website != existing.website:
                    current.add_violation(
                        code="101",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message=f"The channel is not the same as the one defined in {existing_ref}.",
                    )
        else:
            # Rule 102: The channel must have a description.
            if current.description is None:
                current.add_violation(
                    code="102",
                    severity=Severity.ERROR,
                    source_ref=current_ref,
                    message=f"The channel does not have a description.",
                )

            if current.website is not None:
                is_valid, is_secure = cls.__validate_url(current.website)
                # Rule 103: The channel website, if present, must be a valid URL (e.g., https://organization.org).
                if not is_valid:
                    current.add_violation(
                        code="103",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message=f"The channel" "s website is not a valid URL.",
                    )
                # Rule 104: The channel website, if present, must be secure (i.e., use HTTPS, not HTTP).
                elif not is_secure:
                    current.add_violation(
                        code="104",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message=f"The channel" "s website does not use HTTPS.",
                    )

    @classmethod
    def validate_video_during_parsing(cls, current: Video, existing: Optional[Video]) -> None:
        current_ref = current.source_refs[0]
        if existing is not None:
            for existing_ref in existing.source_refs:
                # Rule 200: A video, defined by its id, must not appear more than once per sheet.
                if existing_ref.sheet == current_ref.sheet:
                    current.add_violation(
                        code="200",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message=f"The video is already defined in row {existing_ref.row}.",
                    )
                # Rule 201: A video, defined by its id, that appears on multiple sheets must have the same name,
                #           description, streaming service, duration, production year, and quality.
                elif (
                        current.name != existing.name
                        or current.description != existing.description
                        or current.streaming_service != existing.streaming_service
                        or current.duration != existing.duration
                        or current.production_year != existing.production_year
                        or current.video_quality != existing.video_quality
                ):
                    current.add_violation(
                        code="201",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message=f"The video is not the same as the one defined in {existing_ref}.",
                    )
        else:
            # Rule 202: The video must have a name.
            if current.name is None:
                current.add_violation(
                    code="202", severity=Severity.ERROR, source_ref=current_ref, message="The video does not have name."
                )
            # Rule 203: The video must have a description.
            if current.description is None:
                current.add_violation(
                    code="203",
                    severity=Severity.ERROR,
                    source_ref=current_ref,
                    message=f"The video does not have a description.",
                )
            # Rule 204: The video must have a valid URL comprised of a supported streaming service and video id.
            if (
                    current.streaming_service is None
                    or current.streaming_service != "YouTube"
                    or current.video_id is None
                    or " " in current.video_id
            ):
                current.add_violation(
                    code="204",
                    severity=Severity.ERROR,
                    source_ref=current_ref,
                    message=f"The video does not have a valid URL.",
                )
            # Rule 205: The video must have a valid duration.
            if current.duration is None:
                current.add_violation(
                    code="205",
                    severity=Severity.ERROR,
                    source_ref=current_ref,
                    message=f"The video does not have a valid duration.",
                )
            # Rule 206: The video must have a four digit production year greater than or equal to 1980
            #           (e.g., do not use Month/Year format).
            if current.production_year is None or current.production_year < 1980 or current.production_year > 9999:
                current.add_violation(
                    code="206",
                    severity=Severity.ERROR,
                    source_ref=current_ref,
                    message=f"The video does not have a valid production year.",
                )
            # Rule 207: The video quality must be Poor, Good, or Excellent.
            if current.video_quality is None:
                current.add_violation(
                    code="207",
                    severity=Severity.ERROR,
                    source_ref=current_ref,
                    message=f"The video does not have a valid video quality.",
                )

    @classmethod
    def validate_clip_during_parsing(cls, current: Clip, existing: Optional[Clip]) -> None:
        current_ref = current.source_refs[0]
        if existing is not None:
            for existing_ref in existing.source_refs:
                # Rule 300: A clip, defined by its name, may only appear once per sheet.
                if existing_ref.sheet == current_ref.sheet:
                    current.add_violation(
                        code="300",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message=f"The clip is already defined in row {existing_ref.row}.",
                    )
                else:
                    # Rule 301: A clip, defined by its name, that appears on multiple sheets must have the same type,
                    #           start time, and end time.
                    if (
                            current.clip_type != existing.clip_type
                            or current.start != existing.start
                            or current.end != existing.end
                    ):
                        current.add_violation(
                            code="301",
                            severity=Severity.ERROR,
                            source_ref=current_ref,
                            message=(
                                f"The clip does not have the same type, start time, and end time "
                                f"from the one defined in {existing_ref}."
                            ),
                        )
                    # Rule 302: A clip, defined by its name, that appears on multiple sheets must have topic-specific
                    #           tags (i.e., not have the same tag).
                    # if not any(map(lambda v: v in current.tags, existing.tags)):
                    #     current.add_error(
                    #         code='302',
                    #         severity=Severity.ERROR,
                    #         source_ref=current_ref,
                    #         message=f'Tags must be topic-specific; the clip has the same tag as the clip defined'
                    #                 f' in {existing_ref}.'
                    #     )
                    # Rule 303: A clip, defined by its name, that appears on multiple sheets must have topic-specific
                    #           takeaways (i.e., not have the same takeaway).
                    if (current.takeaways and existing.takeaways and
                            not any(map(lambda v: v in current.takeaways, existing.takeaways))):
                        current.add_violation(
                            code="303",
                            severity=Severity.ERROR,
                            source_ref=current_ref,
                            message=f"Takeaways must be topic-specific; the clip has the same "
                                    f"takeaway as the clip defined in {existing_ref}.",
                        )
        else:
            # Rule 304: The clip must have a name.
            if current.name is None:
                current.add_violation(
                    code="304", severity=Severity.ERROR, source_ref=current_ref, message="The clip must have a name."
                )
            # Rule 305: The clip type must be Long, Medium, or Short.
            elif current.clip_type is None:
                current.add_violation(
                    code="305",
                    severity=Severity.ERROR,
                    source_ref=current_ref,
                    message="The clip type must be Long, Medium, Short.",
                )
            elif current.clip_type == ClipType.SHORT:
                # Rule 310: Short clips must have at least one tag.
                if len(current.tags) == 0:
                    current.add_violation(
                        code="310",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message="The short clip must have at least one tag.",
                    )
                # Rule 313: Short clips must have at least one takeaway.
                if len(current.takeaways) == 0:
                    current.add_violation(
                        code="313",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message="The short clip must have at least one takeaway.",
                    )

                if current.start is not None and current.end is not None:
                    # Rule 309: Short clips must not be longer than TBD seconds.
                    if current.end - current.start > cls.MAX_SHORT_CLIP_DURATION:
                        current.add_violation(
                            code="309",
                            severity=Severity.WARNING,
                            source_ref=current_ref,
                            message=f"The short clip is longer than {cls.MAX_SHORT_CLIP_DURATION.seconds} seconds.",
                        )

            elif current.clip_type == ClipType.MEDIUM:
                # Rule 311: Medium clips must not have any tags.
                if len(current.tags) > 0:
                    current.add_violation(
                        code="311",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message="The medium clip must not have any tags.",
                    )
                # Rule 314: Medium clips must not have any takeaways.
                if len(current.takeaways) > 0:
                    current.add_violation(
                        code="314",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message="The medium clip must not have any takeaways.",
                    )
            elif current.clip_type == ClipType.LONG:
                # Rule 312: Long clips must not have any tags.
                if len(current.tags) > 0:
                    current.add_violation(
                        code="312",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message="The long clip must not have any tags.",
                    )
                # Rule 315: Long clips must not have any takeaways.
                if len(current.takeaways) > 0:
                    current.add_violation(
                        code="315",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message="The long clip must not have any takeaways.",
                    )
            # Rule 306: The clip start time must be a valid duration.
            if current.start is None:
                current.add_violation(
                    code="306",
                    severity=Severity.ERROR,
                    source_ref=current_ref,
                    message="The clip" "s start time is missing or invalid.",
                )
            # Rule 307: The clip end time must be a valid duration.
            if current.end is None:
                current.add_violation(
                    code="307",
                    severity=Severity.ERROR,
                    source_ref=current_ref,
                    message="The clip" "s end time is missing or invalid.",
                )
            if current.start is not None and current.end is not None:
                # Rule 308: The clip end time must be greater than the clip start time.
                if current.end <= current.start:
                    current.add_violation(
                        code="308",
                        severity=Severity.ERROR,
                        source_ref=current_ref,
                        message="The clip" "s end time must be later than its start time.",
                    )

    @classmethod
    def validate_after_parsing(cls, channel_dict: Dict[str, Channel]) -> None:
        for channel in sorted(list(channel_dict.values()), key=lambda c: c.name if c.name is not None else ""):
            for video in channel.videos:
                video_ref = video.source_refs[0]
                shorts, mediums, longs = video.clips_by_type()
                num_of_shorts = len(shorts)
                num_of_mediums = len(mediums)
                num_of_longs = len(longs)

                ####################################################################################################
                # Clips for Videos with Two or More Main Points
                #
                if num_of_longs > 0 or num_of_mediums > 1:
                    shorts_and_parents = [cls.__find_parent(short, mediums) for short in shorts]
                    mediums_and_parents = [cls.__find_parent(medium, longs) for medium in mediums]
                    # Rule 400: There must be one and only one long clip.
                    if num_of_longs != 1:
                        video.add_violation(
                            code="400",
                            severity=Severity.ERROR,
                            source_ref=video_ref,
                            message="The video with two or more main points must have one and only one long clip.",
                        )
                    elif num_of_longs == 1:
                        long = longs[0]
                        can_check_401 = cls.__is_localized(long) and video.duration is not None
                        # Rule 401: The long clip must be entirely inside the video.
                        if can_check_401 and (long.start < cls.ZERO_SECONDS or long.end > video.duration):
                            long.add_violation(
                                code="401",
                                severity=Severity.ERROR,
                                source_ref=long.source_refs[0],
                                message="The long clip must be entirely inside the video.",
                            )
                    # Rule 402: There must be two or more medium clips.
                    if num_of_mediums < 2:
                        video.add_violation(
                            code="402",
                            severity=Severity.ERROR,
                            source_ref=video_ref,
                            message="The video with two or more points must have two or more medium clips.",
                        )
                    for medium_and_parent in mediums_and_parents:
                        # Rule 403: Medium clips must be entirely inside the long clip.
                        if medium_and_parent.parent is None:
                            medium = medium_and_parent.child
                            medium.add_violation(
                                code="403",
                                severity=Severity.ERROR,
                                source_ref=medium.source_refs[0],
                                message="The medium clip must be entirely inside the long clip.",
                            )
                    # Rule 404: Medium clips must not overlap each other by more than 5 seconds.
                    for medium in cls.__overlapping_clips(mediums):
                        medium.add_violation(
                            code="404",
                            severity=Severity.ERROR,
                            source_ref=medium.source_refs[0],
                            message="The medium clip must not overlap another medium clip by more than 5 seconds.",
                        )
                    # Rule 405: There must be at least one short clip contained in each medium clip.
                    for medium in cls.__childless_parents(mediums, shorts_and_parents):
                        medium.add_violation(
                            code="405",
                            severity=Severity.ERROR,
                            source_ref=medium.source_refs[0],
                            message="The medium clip must contain at least more short clip.",
                        )
                    for short_and_parent in shorts_and_parents:
                        # Rule 406: Short clips must be entirely inside their parent medium clip.
                        if short_and_parent.parent is None:
                            short = short_and_parent.child
                            short.add_violation(
                                code="406",
                                severity=Severity.ERROR,
                                source_ref=short.source_refs[0],
                                message="The short clip must be entirely inside its parent medium clip.",
                            )
                    # Rule 407: Short clips must not overlap each other by more than 5 seconds.
                    for short in cls.__overlapping_clips(shorts):
                        short.add_violation(
                            code="407",
                            severity=Severity.ERROR,
                            source_ref=short.source_refs[0],
                            message="The short clip must not overlap another short clip by more than 5 seconds.",
                        )

                ####################################################################################################
                # Clips for Videos with One Main Point
                #
                elif num_of_shorts > 1:
                    shorts_and_parents = [cls.__find_parent(short, mediums) for short in shorts]
                    # Rule 500: There must be one and only one medium clip.
                    if num_of_mediums != 1:
                        video.add_violation(
                            code="500",
                            severity=Severity.ERROR,
                            source_ref=video_ref,
                            message="The video with one main point must have one and only one medium clip.",
                        )
                    elif num_of_mediums == 1:
                        medium = mediums[0]
                        can_check_501 = cls.__is_localized(medium) and video.duration is not None
                        # Rule 501: The medium clip must be entirely inside the video.
                        if can_check_501 and (medium.start < cls.ZERO_SECONDS or medium.end > video.duration):
                            medium.add_violation(
                                code="501",
                                severity=Severity.ERROR,
                                source_ref=medium.source_refs[0],
                                message="The medium clip must be entirely inside the video.",
                            )
                    # Rule 502: There must be at least one short clip.
                    if num_of_shorts < 1:
                        video.add_violation(
                            code="502",
                            severity=Severity.ERROR,
                            source_ref=video_ref,
                            message="The video with one main point must have at least one short clip.",
                        )
                    for short_and_parent in shorts_and_parents:
                        # Rule 503: Short clip(s) must be entirely inside the short clip.
                        if short_and_parent.parent is None:
                            short = short_and_parent.child
                            short.add_violation(
                                code="503",
                                severity=Severity.ERROR,
                                source_ref=short.source_refs[0],
                                message="The short clip must be entirely inside its parent medium clip.",
                            )
                    # Rule 504: Short clips must not overlap each other by more than 5 seconds.
                    for short in cls.__overlapping_clips(shorts):
                        short.add_violation(
                            code="504",
                            severity=Severity.ERROR,
                            source_ref=short.source_refs[0],
                            message="The short clip must not overlap another short clip by more than 5 seconds.",
                        )

                ####################################################################################################
                # Clips for Short Videos
                #
                else:
                    # Rule 600: There must be one and only one short clip.
                    if num_of_shorts != 1:
                        video.add_violation(
                            code="600",
                            severity=Severity.ERROR,
                            source_ref=video_ref,
                            message="Short videos must have one and only one short clip.",
                        )
                    elif num_of_shorts == 1:
                        short = shorts[0]
                        can_check_601 = cls.__is_localized(short) and video.duration is not None
                        # Rule 601: The short clip must be entirely inside the video.
                        if can_check_601 and (short.start < cls.ZERO_SECONDS or short.end > video.duration):
                            short.add_violation(
                                code="601",
                                severity=Severity.ERROR,
                                source_ref=short.source_refs[0],
                                message="The short clip must be entirely contained in the video.",
                            )

    @classmethod
    def __validate_url(cls, url: str) -> Tuple[bool, bool]:
        try:
            components = urlparse(url)
            return all((components.scheme, components.netloc)), components.scheme.lower() == "https"
        except ValueError:
            return False, False

    @classmethod
    def __is_localized(cls, clip: Clip) -> bool:
        return clip.start is not None and clip.end is not None

    @classmethod
    def __find_parent(cls, child: Clip, parents: List[Clip]) -> ChildAndParent:
        if cls.__is_localized(child):
            for parent in parents:
                if cls.__is_localized(parent) and child.start >= parent.start and child.end <= parent.end:
                    return ChildAndParent(child, parent)
        return ChildAndParent(child, None)

    @classmethod
    def __overlapping_clips(cls, clips: List[Clip]) -> List[Clip]:
        overlapping_clips = []
        for index1 in range(len(clips)):
            clip1 = clips[index1]
            if not cls.__is_localized(clip1):
                continue
            for index2 in range(index1 + 1, len(clips)):
                clip2 = clips[index2]
                if not cls.__is_localized(clip2):
                    continue
                if clip1.start + cls.ALLOWED_OVERLAP < clip2.end and clip2.start + cls.ALLOWED_OVERLAP < clip1.end:
                    overlapping_clips.append(clip2)
        return overlapping_clips

    @classmethod
    def __childless_parents(cls, parents: List[Clip], children_and_parents: List[ChildAndParent]) -> List[Clip]:
        return [p for p in parents if len([cp.child for cp in children_and_parents if cp.parent == p]) == 0]

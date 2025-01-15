from datetime import timedelta
from typing import Optional

import drawsvg as draw

from finlecurator.models.video import Video


class Diagram:
    SCALE = 300  # diagram scale
    LEVEL = round(SCALE / 4)  # diagram level height
    PADDING = 5  # diagram padding

    @classmethod
    def create_clip_diagram(cls, video: Video) -> str:
        shorts, mediums, longs = video.clips_by_type()
        need_long_row = len(longs) > 0 or len(mediums) > 1
        need_medium_row = len(longs) > 0 or len(mediums) > 0 or len(shorts) > 1

        video_row = 0
        long_row = 2
        medium_row = 4 if need_long_row else 2
        short_row = 6 if need_long_row else 4 if need_medium_row else 2
        width = 8 * cls.SCALE
        height = 7 * cls.LEVEL if need_long_row else 5 * cls.LEVEL if need_medium_row else 3 * cls.LEVEL
        max_duration = Diagram.__get_max_duration(video)

        drawing = draw.Drawing(width + 2 * cls.PADDING, height + 2 * cls.PADDING, origin=(-cls.PADDING, -cls.PADDING))
        drawing.set_render_size(800, None)

        def draw_clip(uid: Optional[str], start: timedelta, end: timedelta, row: int, fill: str, stroke: str):
            if start is not None and end is not None and start < end:
                attrs = {"fill": fill, "fill_opacity": "0.333", "stroke": stroke, "stroke_width": "2"}
                if uid is not None:
                    attrs["id"] = uid
                x1 = start.seconds / max_duration.seconds * width
                x2 = end.seconds / max_duration.seconds * width
                rect = draw.Rectangle(x1, row * cls.LEVEL, x2 - x1, cls.LEVEL, **attrs)
                drawing.append(rect)

        draw_clip(None, timedelta(0), video.duration, video_row, "gray", "black")
        for clip in longs:
            draw_clip(clip.uid, clip.start, clip.end, long_row, "red", "black")
        for clip in mediums:
            draw_clip(clip.uid, clip.start, clip.end, medium_row, "green", "black")
        for clip in shorts:
            draw_clip(clip.uid, clip.start, clip.end, short_row, "blue", "black")

        return drawing.as_svg()

    @classmethod
    def __get_max_duration(cls, video: Video) -> timedelta:
        max_duration = video.duration if video.duration is not None else timedelta(seconds=0)
        for clip in video.clips:
            if clip.end is not None and max_duration < clip.end:
                max_duration = clip.end
        return max_duration

import html
from typing import Dict, Sequence, List, Optional

from airium import Airium

from finlecurator.models.channel import Channel
from finlecurator.models.model import SourceRef, Violation, Severity, Sheet
from finlecurator.models.video import Video
from finlecurator.reporting.css import CSS
from finlecurator.reporting.diagram import Diagram
from finlecurator.reporting.icons import Icons
from finlecurator.reporting.script import Script


class Report(object):
    def __init__(
        self, channels: Dict[str, Channel], timestamp: str, include_form: bool = True, only_body_content: bool = False
    ):
        self._airium: Airium = Airium()
        self._channels: Dict[str, Channel] = channels
        self._timestamp: str = timestamp
        self._include_form: bool = include_form
        self._only_body_content: bool = only_body_content

    @property
    def channels(self) -> Dict[str, Channel]:
        return self._channels

    @property
    def timestamp(self) -> str:
        return self._timestamp

    @property
    def only_body_content(self) -> bool:
        return self._only_body_content

    def create_video_report(self, csrftoken) -> str:
        # ToDo: See https://gitlab.com/kamichal/airium for Django integration
        if self.only_body_content:
            self.__add_body_content(csrftoken)
        else:
            self._airium("<!DOCTYPE html>")
            with self._airium.html(lang="en"):
                with self._airium.head():
                    self._airium.meta(charset="utf-8")
                    self._airium.title(_t="FinLe Video Curation Report")
                    with self._airium.style():
                        self._airium.append(CSS)
                with self._airium.body():
                    self.__add_body_content(csrftoken)
        return str(self._airium)

    def __add_body_content(self, csrftoken) -> None:
        script = Script()
        self._airium.append(Icons.get_init_svg())
        with self._airium.h1():
            self._airium(f"FinLe Video Curation Report ({self.timestamp})")
        with self._airium.form(id="datasourceForm", method="GET", style="text-align: center;"):
            self._airium.h3(_t="Source: ", style="margin-right: 10px; display: inline;")
            with self._airium.label(_for="database"):
                self._airium.input(type="radio", name="source", value="2", id="database")
                self._airium("Database")
            with self._airium.label(_for="googleSheet"):
                self._airium.input(type="radio", name="source", value="1", id="googleSheet", checked=True)
                self._airium("Google Sheet")
        if self._include_form:
            with self._airium.form(id="refreshForm", method="POST"):
                self._airium.input(type="hidden", name="csrfmiddlewaretoken", value=csrftoken)
                self._airium.input(type="hidden", name="source", id="hiddenSource")
                self._airium.input(type="submit", value="Refresh")
        with self._airium.form(style="text-align: center;"):
            self._airium.h3(_t="Topics: ", style="margin-right: 10px; display: inline;")
            for sheet in Sheet:
                with self._airium.label(_for=sheet.title()):
                    self._airium.input(type="checkbox", name="sheets", value=sheet, id=sheet.name, checked=True)
                    self._airium(sheet.title())
        with self._airium.div(klass="channels"):
            for channel in sorted(self.channels.values(), key=lambda x: x.sort_value):
                script.process_channel(channel)
                channel_has_violations = len(channel.violations) > 0
                channel_has_errors = any(v.severity == Severity.ERROR for v in channel.violations)
                with self._airium.div(klass="channel " + channel.sheets):
                    with self._airium.table(klass="master"):
                        self.__add_column_group((64, 96, 736))
                        self.__add_channel_header(channel, channel_has_errors)
                        if channel_has_violations:
                            self.__add_violation_header()
                            for error in sorted(
                                channel.violations, key=lambda e: (e.source_ref.sheet.value, e.source_ref.row, e.code)
                            ):
                                self.__add_violation(error)
                    for video in sorted(channel.videos, key=lambda x: x.sort_value):
                        script.process_video(video)
                        for clip in sorted(video.clips, key=lambda x: x.sort_value):
                            script.process_clip(clip, video.video_id)
                        video_violations: List[Violation] = video.violations
                        video_violations.extend(e for c in video.clips for e in c.violations)
                        video_has_violations = len(video_violations) > 0
                        video_has_errors = any(v.severity == Severity.ERROR for v in video_violations)
                        with self._airium.div(klass="video " + video.sheets).table(klass="master"):
                            self.__add_column_group((64, 96, 640))
                            self.__add_video_header(video, video_has_errors)
                            with self._airium.tr():
                                with self._airium.td(colspan="3", klass="clip-diagram"):
                                    self._airium.append(Diagram.create_clip_diagram(video))
                            if video_has_violations:
                                self.__add_violation_header()
                                for error in sorted(
                                    video_violations, key=lambda e: (e.source_ref.sheet.value, e.source_ref.row, e.code)
                                ):
                                    self.__add_violation(error)
        self._airium.append(Script.HTML)
        with self._airium.script():
            self._airium.append(Script.JAVASCRIPT)
            self._airium.break_source_line()
            self._airium.append(script.get_init_func())
            self._airium.break_source_line()
            self._airium.append(script.get_details_json())
            self._airium.break_source_line()
            self._airium.append(script.handle_checkbox_click())
            self._airium.break_source_line()
            self._airium.append(script.handle_radio_click())

    def __add_column_group(self, column_widths: Sequence[int]):
        with self._airium.colgroup():
            for column_width in column_widths:
                self._airium.col(style=f"width: {column_width}px")

    def __add_channel_header(self, channel: Channel, has_errors: bool):
        self.__add_header(
            uid=channel.uid,
            icon_symbol="channel-icon",
            icon_class="error" if has_errors else None,
            name=channel.name,
            source_refs=channel.source_refs,
        )

    def __add_video_header(self, video: Video, has_errors: bool):
        self.__add_header(
            uid=video.uid,
            icon_symbol="video-icon",
            icon_class="error" if has_errors else None,
            name=video.name,
            source_refs=video.source_refs,
        )

    def __add_header(
        self, uid: str, icon_symbol: str, icon_class: Optional[str], name: str, source_refs: List[SourceRef]
    ):
        with self._airium.tr():
            with self._airium.td(rowspan="2"):
                self._airium.append(Icons.get_link_svg(icon_symbol, icon_class))
            with self._airium.td(id=uid, colspan="2"):
                self._airium.append(html.escape(name if name is not None else "n/a"))
        with self._airium.tr():
            with self._airium.td(colspan="2"):
                self._airium.append(", ".join([str(ref) for ref in source_refs]))

    def __add_violation_header(self):
        with self._airium.tr():
            with self._airium.td(colspan="3", klass="violation-label"):
                self._airium.append("Rule Violations")

    def __add_violation(self, violation: Violation):
        with self._airium.tr(klass="violation error" if violation.severity == Severity.ERROR else "violation"):
            with self._airium.td():
                self._airium.append(violation.code)
            with self._airium.td():
                self._airium.append(str(violation.source_ref))
            with self._airium.td():
                self._airium.append(violation.message)

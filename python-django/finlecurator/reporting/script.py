import html
import json
from datetime import timedelta
from typing import Dict, List, Optional

from finlecurator.models.channel import Channel
from finlecurator.models.clip import Clip, ClipType
from finlecurator.models.video import Video, VideoQuality


class Script(object):
    NONE_VALUE: str = html.escape("n/a")

    HTML: str = """
    <div id="ChannelPopup" class="popup">
      <h3>Channel</h3>
      <table class="popup">
        <tr><th>Name</th><td id="ChannelName"></td></tr>
        <tr><th>Description</th><td id="ChannelDescription"></td></tr>
        <tr><th>Website</th><td id="ChannelWebsite"></td></tr>
        <tr><th>Spreadsheet</th><td id="ChannelSourceRefs"></td></tr>
      </table>
    </div>
    <div id="VideoPopup" class="popup">
      <h3>Video</h3>
      <table class="popup">
        <tr><th>Name</th><td id="VideoName"></td></tr>
        <tr><th>Description</th><td id="VideoDescription"></td></tr>
        <tr><th>Streaming Service</th><td id="VideoStreamingService"></td></tr>
        <tr><th>Video Id</th><td id="VideoVideoId"></td></tr>
        <tr><th>Duration</th><td id="VideoDuration"></td></tr>
        <tr><th>Production Year</th><td id="VideoProductionYear"></td></tr>
        <tr><th>Video Quality</th><td id="VideoVideoQuality"></td></tr>
        <tr><th>Spreadsheet</th><td id="VideoSourceRefs"></td></tr>
      </table>
    </div>
    <div id="ClipPopup" class="popup">
      <h3>Clip</h3>
      <table class="popup">
        <tr><th>Name</th><td id="ClipName"></td></tr>
        <tr><th>Type</th><td id="ClipClipType"></td></tr>
        <tr><th>Start</th><td id="ClipStart"></td></tr>
        <tr><th>End</th><td id="ClipEnd"></td></tr>
        <tr><th>Purpose</th><td id="ClipPurpose"></td></tr>
        <tr><th>Relevancy</th><td id="ClipRelevancy"></td></tr>
        <tr><th>Tags</th><td id="ClipTags"></td></tr>
        <tr><th>Takeaways</th><td id="ClipTakeaways"></td></tr>
        <tr><th>Spreadsheet</th><td id="ClipSourceRefs"></td></tr>
      </table>
    </div>
    """

    JAVASCRIPT: str = """
    window.addEventListener("load", initialize);

    const channelPopup = document.getElementById("ChannelPopup");
    const videoPopup = document.getElementById("VideoPopup");
    const clipPopup = document.getElementById("ClipPopup");

    function updateDetail(id, detail) {
      let e = document.getElementById(id);
      if (e != null)
        e.innerHTML = detail;
    }

    function getChannelPopup(details) {
      updateDetail("ChannelName", details["name"]);
      updateDetail("ChannelDescription", details["description"]);
      updateDetail("ChannelWebsite", details["website"]);
      updateDetail("ChannelSourceRefs", details["sourceRefs"]);
      return channelPopup;
    }

    function getVideoPopup(details) {
      updateDetail("VideoName", details["name"]);
      updateDetail("VideoDescription", details["description"]);
      updateDetail("VideoStreamingService", details["streamingService"]);
      updateDetail("VideoVideoId", details["videoId"]);
      updateDetail("VideoDuration", details["duration"]);
      updateDetail("VideoProductionYear", details["productionYear"]);
      updateDetail("VideoVideoQuality", details["videoQuality"]);
      updateDetail("VideoSourceRefs", details["sourceRefs"]);
      return videoPopup;
    }

    function getClipPopup(details) {
      updateDetail("ClipName", details["name"]);
      updateDetail("ClipClipType", details["clipType"]);
      updateDetail("ClipStart", details["start"]);
      updateDetail("ClipEnd", details["end"]);
      updateDetail("ClipPurpose", details["purpose"]);
      updateDetail("ClipRelevancy", details["relevancy"]);
      updateDetail("ClipTags", details["tags"]);
      updateDetail("ClipTakeaways", details["takeaways"]);
      updateDetail("ClipSourceRefs", details["sourceRefs"]);
      return clipPopup;
    }

    function getPopupElem(id) {
      let details = DETAILS[id];
      if (details == null)
        return null;

      switch(id.substring(0,2)) {
        case "Ch": return getChannelPopup(details);
        case "Vi": return getVideoPopup(details);
        case "Cl": return getClipPopup(details);
        default: return null;
       }
    }

    function showPopup(evt) {
      let popup = getPopupElem(evt.target.id);
      if (popup != null) {
        let pos = evt.target.getBoundingClientRect();
        popup.style.left = (pos.right + 20) + "px";
        popup.style.top = (window.scrollY + pos.top - 60) + "px";
        popup.style.display = "block";
      }
    }

    function hidePopup(evt) {
      let popup = getPopupElem(evt.target.id);
      if (popup != null) {
        popup.style.display = "none";
      }
    }

    function addHELs(id) {
      let e = document.getElementById(id);
      if (e != null) {
        e.addEventListener("mouseover", showPopup);
        e.addEventListener("mouseout", hidePopup);
      }
    }

    function playVideo(evt) {
      let details = DETAILS[event.target.id];
      if (details != null) {
        let videoId = details["videoId"];
        let start = "videoStart" in details ? details["videoStart"] : 0;
        window.open("https://youtu.be/" + videoId + "?t=" + start.toString(), "_blank");
      }
    }

    function addCEL(id) {
      let e = document.getElementById(id);
      if (e != null) {
        e.addEventListener("click", playVideo);
      }
    }
    """

    def __init__(self):
        self._details: Dict[str, Dict[str, str]] = {}
        self._init_code: List[str] = []

    def process_channel(self, channel: Channel) -> None:
        channel_id = channel.uid
        self._init_code.append(f'addHELs("{channel_id}");')
        self._details[channel_id] = {
            "name": channel.name,
            "description": Script.__process_string(channel.description),
            "website": Script.__process_string(channel.website),
            "sourceRefs": ", ".join([str(ref) for ref in channel.source_refs]),
        }

    def process_video(self, video: Video) -> None:
        video_id = video.uid
        self._init_code.append(f'addCEL("{video_id}");')
        self._init_code.append(f'addHELs("{video_id}");')
        self._details[video_id] = {
            "name": Script.__process_string(video.name),
            "description": Script.__process_string(video.description),
            "streamingService": Script.__process_string(video.streaming_service),
            "videoId": Script.__process_string(video.video_id),
            "duration": Script.__process_duration(video.duration),
            "productionYear": Script.__process_integer(video.production_year),
            "videoQuality": Script.__process_video_quality(video.video_quality),
            "sourceRefs": ", ".join([str(ref) for ref in video.source_refs]),
        }

    def process_clip(self, clip: Clip, video_id: str) -> None:
        clip_id = clip.uid
        self._init_code.append(f'addCEL("{clip_id}");')
        self._init_code.append(f'addHELs("{clip_id}");')
        self._details[clip_id] = {
            "name": Script.__process_string(clip.name),
            "clipType": Script.__process_clip_type(clip.clip_type),
            "start": Script.__process_duration(clip.start),
            "end": Script.__process_duration(clip.end),
            "purpose": Script.__process_clip_purpose(clip.motivational, clip.instructional),
            "relevancy": Script.__process_float(clip.relevancy),
            "tags": Script.__process_list(clip.tags),
            "takeaways": Script.__process_list(clip.takeaways),
            "sourceRefs": ", ".join([str(ref) for ref in clip.source_refs]),
            "videoId": video_id,
            "videoStart": clip.start.seconds if clip.start is not None else 0,
        }

    def get_init_func(self) -> str:
        return "function initialize() {" + "".join(self._init_code) + "}"

    def get_details_json(self) -> str:
        return "const DETAILS = " + json.dumps(self._details)

    def handle_checkbox_click(self) -> str:
        return '''
            function shouldShowElement(element, checkedTopics) {
                for (let i = 0; i < checkedTopics.length; i++) {
                    if (element.classList.contains(checkedTopics[i])) {
                        return true;
                    }
                }
                return false;
            }

            function handleCheckboxClick(event) {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                const checkedTopics = [];
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        checkedTopics.push(checkbox.id);
                    }
                });

                const channelElements = document.querySelectorAll('.channel');
                channelElements.forEach(element => {
                    if (shouldShowElement(element, checkedTopics)) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });

                const videoElements = document.querySelectorAll('.video');
                videoElements.forEach(element => {
                    if (shouldShowElement(element, checkedTopics)) {
                        element.classList.remove('hidden');
                    } else {
                        element.classList.add('hidden');
                    }
                });
            }

            document.addEventListener('DOMContentLoaded', function() {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(checkbox => {
                    checkbox.addEventListener('click', handleCheckboxClick);
                });
                handleCheckboxClick();
            });
        '''

    def handle_radio_click(self) -> str:
        return '''
            document.addEventListener('DOMContentLoaded', function() {
                const radios = document.querySelectorAll('input[type="radio"][name="source"]');
                radios.forEach(radio => {
                    radio.addEventListener('change', function() {
                        const selectedSource = document.querySelector('input[name="source"]:checked').value;
                        window.location.href = `?source=${encodeURIComponent(selectedSource)}`;
                    });
                });

                // Set the initial selection based on the 'source' URL parameter
                const urlParams = new URLSearchParams(window.location.search);
                const source = urlParams.get('source') || '1';
                const defaultRadio = document.querySelector(`input[name="source"][value="${source}"]`);
                if (defaultRadio) {
                    defaultRadio.checked = true;
                }

                // Update hidden input field in Refresh form with selected source value
                const refreshForm = document.getElementById('refreshForm');
                if (refreshForm) {
                    refreshForm.addEventListener('submit', function() {
                        const selectedSource = document.querySelector('input[name="source"]:checked').value;
                        document.getElementById('hiddenSource').value = selectedSource;
                    });
                }
            });
        '''

    @classmethod
    def __process_string(cls, value: Optional[str]) -> str:
        return html.escape(value) if value is not None else cls.NONE_VALUE

    @classmethod
    def __process_integer(cls, value: Optional[int]) -> str:
        return str(value) if value is not None else cls.NONE_VALUE

    @classmethod
    def __process_float(cls, value: Optional[float]) -> str:
        return f"{value:.2f}" if value is not None else cls.NONE_VALUE

    @classmethod
    def __process_duration(cls, value: Optional[timedelta]) -> str:
        return str(value) if value is not None else cls.NONE_VALUE

    @classmethod
    def __process_list(cls, str_list: Optional[List[str]]) -> str:
        if str_list is not None and len(str_list) > 0:
            return "<ul>" + "".join([f"<li>{html.escape(item)}</li>" for item in str_list]) + "</ul>"
        else:
            return cls.NONE_VALUE

    @classmethod
    def __process_video_quality(cls, enum: Optional[VideoQuality]) -> str:
        return enum.name.title() if enum is not None else cls.NONE_VALUE

    @classmethod
    def __process_clip_type(cls, enum: Optional[ClipType]) -> str:
        return enum.name.title() if enum is not None else cls.NONE_VALUE

    @classmethod
    def __process_clip_purpose(cls, motivational: Optional[bool], instructional: Optional[bool]) -> str:
        if motivational is None or instructional is None:
            return cls.NONE_VALUE
        elif motivational and not instructional:
            return "Motivational"
        elif not motivational and instructional:
            return "Instructional"
        else:
            return html.escape("Motivational & Instructional")

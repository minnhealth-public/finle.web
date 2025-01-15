from logging import INFO, getLogger
from time import time
from datetime import datetime
import traceback

from django.contrib.admin.views.decorators import staff_member_required
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view
from django.middleware.csrf import get_token

from finlecurator.models.model import Source
from finlecurator.curator import Generator
from finlecurator.data.gsheets_analyzer import GSheetsAnalyzer
from finlecurator.data.database_analyzer import DBAnalyzer

from .curator_audit_utils import get_missing_item_details, lists_are_equal, get_channel_details, get_video_details, \
    get_clip_details, get_channel_json, get_video_json, get_clip_json, add_channel, add_video, add_clip, \
    update_channel, update_video, update_clip, fetch_dataframes, is_channel_valid, is_video_valid, is_clip_valid

AUDIT_GENERATOR = Generator()

LOGGER = getLogger(__name__)
LOGGER.setLevel(INFO)


@login_required(login_url="/admin/login/")
@api_view(["GET", "POST"])
def get_audit_report(request):
    """Generate the video curation audit information and render it as an HTML report."""
    do_refresh = 0
    source = request.GET.get('source', Source.GSHEETS.value)

    if request.method == "POST":
        do_refresh = 1
        source = request.POST.get('source', Source.GSHEETS.value)

    LOGGER.info(f"[{time()}] Started audit report generation -> Refresh={do_refresh}")
    html_report = AUDIT_GENERATOR.run(refresh=do_refresh, source=source, csrftoken=get_token(request))
    LOGGER.info(f"[{time()}] Finished audit report generation")
    return HttpResponse(html_report, status=status.HTTP_200_OK)


@staff_member_required
def compare_audit_reports(request):
    sheets_analyzer = GSheetsAnalyzer()
    db_analyzer = DBAnalyzer()
    rows = []

    load_db = request.GET.get('loadDb', 1)
    load_sheet = request.GET.get('loadSheet', 1)

    try:
        [db_channels, sheet_channels] = fetch_dataframes(sheets_analyzer, db_analyzer, load_db, load_sheet)

        for channel_key in db_channels | sheet_channels:
            rows.extend(compare_data(sheets_analyzer, db_analyzer, channel_key))

        return render(
            request,
            "admin/app_web/overview_dashboard/audit_comparison_table.html",
            {
                "rows": rows
            }
        )
    except Exception as e:
        stack_trace = traceback.format_exc()
        error_message = f'{str(e)}\n\nStack trace:\n{stack_trace}'
        return JsonResponse({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@staff_member_required
@api_view(["POST"])
def audit_merge(request):
    data = request.data
    action = data.get('action')
    details = data.get('details')
    dest = data.get('destination')
    source_refs = data.get('source_refs')

    LOGGER.info(f"AUDIT MERGE -> dest: {dest}, action: {action}, details: {details}, source_refs: {source_refs}")

    try:
        if dest == 'db':
            if action == 'AddChannel':
                add_channel(details)

            if action == 'UpdateChannel':
                update_channel(details)

            if action == 'AddVideo':
                add_video(details)

            if action == 'UpdateVideo':
                update_video(details)

            if action == 'AddClip':
                add_clip(details)

            if action == 'UpdateClip':
                update_clip(details)
        elif dest == 'sheet':
            if action == 'AddChannel':
                GSheetsAnalyzer.add_channel_to_sheet(details, source_refs)

            if action == 'UpdateChannel':
                GSheetsAnalyzer.update_channel_to_sheet(details, source_refs)

            if action == 'AddVideo':
                GSheetsAnalyzer.add_video_to_sheet(details, source_refs)

            if action == 'UpdateVideo':
                GSheetsAnalyzer.update_video_to_sheet(details, source_refs)

            if action == 'AddClip':
                GSheetsAnalyzer.add_clip_to_sheet(details, source_refs)

            if action == 'UpdateClip':
                GSheetsAnalyzer.update_clip_to_sheet(details, source_refs)

    except Exception as e:
        stack_trace = traceback.format_exc()
        error_message = f'{str(e)}\n\nStack trace:\n{stack_trace}'
        return JsonResponse({'error': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return JsonResponse({'success': True}, status=status.HTTP_200_OK)


@staff_member_required
def backup_to_excel(request):
    source = int(request.GET.get('source'))

    if source == Source.GSHEETS.value:
        analyzer = GSheetsAnalyzer()
        filename_prefix = 'sheet'
    elif source == Source.DATABASE.value:
        analyzer = DBAnalyzer()
        filename_prefix = 'db'
    else:
        return JsonResponse({'error': "Bad Request. Source is not valid."}, status=status.HTTP_400_BAD_REQUEST)

    analyzer.fetch_video_data(refresh=1)

    now = datetime.now()
    date_str = now.strftime("%m%d%Y")
    timestamp_ms = int(now.timestamp() * 1000)  # Current time in milliseconds
    filename = f"{filename_prefix}_export_{date_str}_{timestamp_ms}.xlsx"

    return analyzer.create_excel_file(filename=filename)


def compare_data(sheets_analyzer, db_analyzer, channel_key):
    def add_row(db_html, sheet_html, db_json, sheet_json, merge_action, diff_desc):
        rows.append({
            'db_html': db_html,
            'sheet_html': sheet_html,
            'difference': {'merge_action': merge_action, 'description': diff_desc},
            'db_json': db_json,
            'sheet_json': sheet_json,
        })

    rows = []

    sheet_channel = sheets_analyzer.get_channel(channel_key)
    db_channel = db_analyzer.get_channel(channel_key)

    sheet_has_channel = sheet_channel is not None
    db_has_channel = db_channel is not None

    # Only show the channels that don't have any violations
    sheet_is_valid = is_channel_valid(sheet_channel)
    db_is_valid = is_channel_valid(db_channel)

    if sheet_has_channel and db_has_channel:
        if sheet_channel.description != db_channel.description:
            add_row(db_html=get_channel_details(db_channel), sheet_html=get_channel_details(sheet_channel),
                    db_json=get_channel_json(db_channel), sheet_json=get_channel_json(sheet_channel),
                    merge_action='UpdateChannel', diff_desc='Channel description mismatch')

        sheet_videos = sheet_channel.videos
        db_videos = db_channel.videos
        unique_videos = {video.video_id: video for video in sheet_videos + db_videos}.values()

        # Check videos
        for video in list(unique_videos):
            sheet_video = sheets_analyzer.get_video(video.video_id)
            db_video = db_analyzer.get_video(video.video_id)

            sheet_has_video = sheet_video is not None
            db_has_video = db_video is not None

            sheet_is_valid = is_video_valid(sheet_video)
            db_is_valid = is_video_valid(db_video)

            if sheet_has_video and db_has_video:
                differences = []
                if sheet_video.name != db_video.name:
                    differences.append("Video name mismatch.")
                if sheet_video.description != db_video.description:
                    differences.append("Video description mismatch.")
                if sheet_video.streaming_service != db_video.streaming_service:
                    differences.append("Video streaming service mismatch.")
                if sheet_video.production_year != db_video.production_year:
                    differences.append("Video production year mismatch.")
                if sheet_video.video_quality != db_video.video_quality:
                    differences.append("Video quality mismatch.")

                if len(differences) > 0:
                    add_row(db_html=get_video_details(db_channel.name, db_video),
                            sheet_html=get_video_details(sheet_channel.name, sheet_video),
                            db_json=get_video_json(db_channel.name, db_video),
                            sheet_json=get_video_json(sheet_channel.name, sheet_video),
                            merge_action='UpdateVideo', diff_desc='</br>'.join(differences))

                # Check clips
                sheet_clips = sheet_video.clips
                db_clips = db_video.clips
                unique_clips = {f"{clip.name}_{clip.speaker if clip.speaker is not None else 'UNSPECIFIED'}": clip
                                for clip in sheet_clips + db_clips if clip.name is not None}.values()

                for clip in list(unique_clips):
                    clip_type = str(clip.clip_type) if clip.clip_type is not None else "UNSPECIFIED"
                    clip_speaker = clip.speaker if clip.speaker is not None else "UNSPECIFIED"
                    clip_key = "[" + clip_type + "] " + clip.name.upper() + f"[{clip_speaker}]" \
                        if clip.name is not None else None

                    sheet_clip = sheets_analyzer.get_clip(clip_key)
                    db_clip = db_analyzer.get_clip(clip_key)

                    sheet_has_clip = sheet_clip is not None
                    db_has_clip = db_clip is not None

                    sheet_is_valid = is_clip_valid(sheet_clip)
                    db_is_valid = is_clip_valid(db_clip)

                    if sheet_has_clip and db_has_clip:
                        differences = []

                        if sheet_clip.clip_type != db_clip.clip_type:
                            differences.append("Clip type mismatch.")
                        if sheet_clip.start != db_clip.start:
                            differences.append("Clip start time mismatch.")
                        if sheet_clip.end != db_clip.end:
                            differences.append("Clip end time mismatch.")
                        if sheet_clip.motivational != db_clip.motivational:
                            differences.append("Clip motivational mismatch.")
                        if sheet_clip.instructional != db_clip.instructional:
                            differences.append("Clip instructional mismatch.")
                        if sheet_clip.relevancy != db_clip.relevancy:
                            differences.append("Clip relevancy mismatch.")
                        # Not comparing tags at the moment
                        # if not lists_are_equal(sheet_clip.tags, db_clip.tags):
                        #     differences.append("Clip tags mismatch.")
                        if not lists_are_equal(sheet_clip.takeaways, db_clip.takeaways):
                            differences.append("Clip takeaways mismatch.")

                        if len(differences) > 0:
                            add_row(db_html=get_clip_details(db_channel.name, db_clip),
                                    sheet_html=get_clip_details(sheet_channel.name, sheet_clip),
                                    db_json=get_clip_json(db_video, db_clip),
                                    sheet_json=get_clip_json(sheet_video, sheet_clip),
                                    merge_action='UpdateClip', diff_desc='</br>'.join(differences))

                    elif sheet_has_clip and sheet_is_valid:
                        add_row(db_html=get_missing_item_details(db_clip),
                                sheet_html=get_clip_details(sheet_channel.name, sheet_clip),
                                db_json={}, sheet_json=get_clip_json(sheet_video, sheet_clip),
                                merge_action='AddClip', diff_desc='Clip only exists in spreadsheet.')

                    elif db_has_clip and db_is_valid:
                        add_row(db_html=get_clip_details(db_channel.name, db_clip),
                                sheet_html=get_missing_item_details(sheet_clip),
                                db_json=get_clip_json(db_video, db_clip), sheet_json={},
                                merge_action='AddClip', diff_desc='Clip only exists in database.')

            elif sheet_has_video and sheet_is_valid:
                add_row(db_html=get_missing_item_details(db_video),
                        sheet_html=get_video_details(sheet_channel.name, sheet_video, include_clips=True),
                        db_json={}, sheet_json=get_video_json(sheet_channel.name, sheet_video, include_clips=True),
                        merge_action='AddVideo', diff_desc='Video only exists in spreadsheet.')

            elif db_has_video and db_is_valid:
                add_row(db_html=get_video_details(db_channel.name, db_video, include_clips=True),
                        sheet_html=get_missing_item_details(sheet_video),
                        db_json=get_video_json(db_channel.name, db_video, include_clips=True), sheet_json={},
                        merge_action='AddVideo', diff_desc='Video only exists in database.')

    elif sheet_has_channel and sheet_is_valid:
        add_row(db_html=get_missing_item_details(db_channel),
                sheet_html=get_channel_details(sheet_channel, include_videos=True),
                db_json={}, sheet_json=get_channel_json(sheet_channel, include_videos=True),
                merge_action='AddChannel', diff_desc='Channel only exists in spreadsheet.')

    elif db_has_channel and db_is_valid:
        add_row(db_html=get_channel_details(db_channel, include_videos=True),
                sheet_html=get_missing_item_details(sheet_channel),
                db_json=get_channel_json(db_channel, include_videos=True), sheet_json={},
                merge_action='AddChannel', diff_desc='Channel only exists in database.')

    return rows

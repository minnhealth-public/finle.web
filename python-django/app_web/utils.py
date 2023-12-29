from .models import Clip


def get_clip_queryset(video_id, clip_type):
    if video_id is not None and clip_type == "SHORT":
        return Clip.objects.filter(video=video_id, type="MEDIUM")
    elif video_id is not None and clip_type == "MEDIUM":
        return Clip.objects.filter(video=video_id, type="LONG")
    else:
        return Clip.objects.none()

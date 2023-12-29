from rest_framework.decorators import api_view
from rest_framework.response import Response

from app_web.models import Clip, GlossaryTerm, Partner, Story
from app_web.serializers import (
    ClipParentSerializer,
    ClipSerializer,
    GlossaryTermSerializer,
    PartnerSerializer,
    StorySerializer,
)
from app_web.utils import get_clip_queryset


@api_view(["GET"])
def get_routes(request):
    routes = [
        {
            "Endpoint": "/api/shorts",
            "method": "GET",
            "body": None,
            "description": "Returns an array of shorts, ordered for the user provided in the headers.",
        },
        {
            "Endpoint": "/api/shorts/{id}/",
            "method": "GET",
            "body": None,
            "description": "Returns the short JSON object with specified id.",
        },
        {
            "Endpoint": "/api/shorts/{id}",
            "method": "PUT",
            "body": {"body": ""},
            "description": "Updates the given short with the details provided in the body, like played or rating.",
        },
        {
            "Endpoint": "/api/glossary/",
            "method": "GET",
            "description": "Returns all the glossary terms.",
        },
        {
            "Endpoint": "/api/glossary/{id}",
            "method": "GET",
            "description": "Returns the glossary term with the specified id.",
        },
        {
            "Endpoint": "/api/stories/",
            "method": "GET",
            "description": "Returns the list of stories that will show on the preauth landing page.",
        },
        # {
        #     'Endpoint': '/api/notes',
        #     'method': 'GET',
        #     'body': None,
        #     'description': 'Returns the list of note objects created by the user.'
        # },
        # {
        #     'Endpoint': '/api/notes',
        #     'method': 'POST',
        #     'body': {
        #         "body": ""
        #     },
        #     'description': 'Creates a new note object'
        # },
    ]

    return Response(routes)


@api_view(["GET"])
def get_shorts(request):
    shorts = Clip.objects.prefetch_related("video").filter(type=Clip.ClipType.SHORT).order_by("name")
    serializer = ClipSerializer(shorts, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_short(request, clip_id):
    clip = Clip.objects.get(id=clip_id)
    serializer = ClipSerializer(clip, many=False)
    return Response(serializer.data)


@api_view(["PUT"])
def put_short(request, clip_id):
    clip = Clip.objects.get(id=clip_id)
    serializer = ClipSerializer(clip, many=False, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=400)


# @api_view(['GET'])
# def get_notes(request):
#     notes = Note.objects.order_by('timestamp')
#     serializer = NoteSerializer(notes, many=True)
#     return Response(serializer.data)
#
# @api_view(['POST'])
# def post_note(request):
#     serializer = NoteSerializer(many=False, data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         return Response(serializer.data, status=201)
#     return Response(serializer.errors, status=400)


@api_view(["GET"])
# Example of how to lock view
# @permission_classes([IsAuthenticated])
def get_clips(request):
    video_id = request.query_params.get("video")
    clip_type = request.query_params.get("type")
    serializer = ClipParentSerializer(get_clip_queryset(video_id, clip_type), many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_glossary_terms(request):
    terms = GlossaryTerm.objects.all()
    serializer = GlossaryTermSerializer(terms, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_glossary_term(request, term_id):
    term = GlossaryTerm.objects.get(id=term_id)
    serializer = GlossaryTermSerializer(term, many=False)
    return Response(serializer.data)


@api_view(["GET"])
def get_stories(request):
    stories = Story.objects.all()
    serializer = StorySerializer(stories, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_partners(request):
    partners = Partner.objects.all()
    serializer = PartnerSerializer(partners, many=True)
    return Response(serializer.data)

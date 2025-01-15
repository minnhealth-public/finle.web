from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from app_web import utils

from app_web.models import GlossaryTerm

from .serializer import GlossaryTermSerializer


@api_view(["GET"])
def get_glossary_terms(request):
    terms = GlossaryTerm.objects.prefetch_related("related_terms", "related_clips").all()
    serializer = GlossaryTermSerializer(terms, many=True)
    return Response(serializer.data)


@api_view(["GET"])
def get_glossary_term(request, term_id):
    try:
        term = GlossaryTerm.objects.get(id=term_id)
        serializer = GlossaryTermSerializer(term, many=False)
        return Response(serializer.data)
    except GlossaryTerm.DoesNotExist:
        return Response(status=status.HTTP_400_BAD_REQUEST)


@staff_member_required
def get_check_links(request):
    warnings = []
    terms = GlossaryTerm.objects.all()
    for term in terms:
        if not utils.check_link(term.source):
            warnings.append(
                {"model": "glossaryterm", "id": term.id, "url": term.source})

    return render(
        request,
        "admin/app_web/overview_dashboard/warnings.html",
        {
            "model": "GlossaryTerm",
            "warnings": warnings
        }
    )

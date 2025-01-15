from .glossary_terms import (
    get_glossary_term,
    get_glossary_terms,
    get_check_links
)
from .serializer import GlossaryTermSerializer

__all__ = [
    # routes
    "get_glossary_term",
    "get_glossary_terms",
    "get_check_links",
    # serializers
    "GlossaryTermSerializer",
]

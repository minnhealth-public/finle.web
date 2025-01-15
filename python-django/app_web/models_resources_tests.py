import json

import pytest
from django.urls import reverse
from rest_framework import status

from app_web import models


@pytest.fixture(autouse=True)
def resources():
    """Add a set of resources to the database, one for each resource type."""
    # Setup
    resources_list = []
    for _, resource_type in enumerate(models.Resource.ResourceType):
        resource_obj = models.Resource.objects.create(
            title=f"{resource_type.title()} Resource",
            link="https://test_resource_url.com",
            type=resource_type,
        )
        resources_list.append(resource_obj)

    return resources_list

    # Tear down


@pytest.mark.django_db()
class TestResources:
    def test_resources(self, resources):
        assert isinstance(resources[0], models.Resource)
        assert len(resources) == len(models.Resource.ResourceType)


@pytest.mark.django_db()
class TestResourcesApi:
    def test_api_routes(self, client):
        """Fetch list of api elements."""
        response = client.get(reverse("routes"))
        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("Content-Type") == "application/json"

        # Routes should be valid json
        api_content = json.loads(response.content)

        # Grab endpoints from the api listings and audit the list for a few expected items
        endpoints = {item.get("Endpoint") for item in api_content}
        assert None not in endpoints
        assert "/api/resources/" in endpoints

    def test_api_resources_all(self, client, resources):
        """Fetch all resources via the api."""
        response = client.get(reverse("get_resources"))
        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("Content-Type") == "application/json"

        articles = [(article["id"], article["title"]) for article in response.data]
        resource_article = next(
            iter([article for article in resources if article.type == models.Resource.ResourceType.ARTICLE]),
        )
        assert (resource_article.id, resource_article.title) in articles

        brochures = [(brochure["id"], brochure["title"]) for brochure in response.data]
        resource_brochure = next(
            iter([brochure for brochure in resources if brochure.type == models.Resource.ResourceType.BROCHURE]),
        )
        assert (resource_brochure.id, resource_brochure.title) in brochures

        worksheets = [(worksheet["id"], worksheet["title"]) for worksheet in response.data]
        resource_worksheet = next(
            iter([worksheet for worksheet in resources if worksheet.type == models.Resource.ResourceType.WORKSHEET]),
        )
        assert (resource_worksheet.id, resource_worksheet.title) in worksheets

        workbooks = [(workbook["id"], workbook["title"]) for workbook in response.data]
        resource_workbook = next(
            iter([workbook for workbook in resources if workbook.type == models.Resource.ResourceType.WORKBOOK]),
        )
        assert (resource_workbook.id, resource_workbook.title) in workbooks

        books = [(book["id"], book["title"]) for book in response.data]
        resource_book = next(iter([book for book in resources if book.type == models.Resource.ResourceType.BOOK]))
        assert (resource_book.id, resource_book.title) in books

        web_tools = [(web_tool["id"], web_tool["title"]) for web_tool in response.data]
        resource_web_tool = next(
            iter([web_tool for web_tool in resources if web_tool.type == models.Resource.ResourceType.WEB_TOOL]),
        )
        assert (resource_web_tool.id, resource_web_tool.title) in web_tools

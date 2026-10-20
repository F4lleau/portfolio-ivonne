from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers
from .services import list_repositories, import_repository
from apps.projects.serializers import ProjectSerializer


class GitHubView(APIView):
    def get(self, request):
        return Response(list_repositories())

    def post(self, request):
        class Input(serializers.Serializer):
            repo_id = serializers.IntegerField(min_value=1)

        form = Input(data=request.data)
        form.is_valid(raise_exception=True)
        project, created = import_repository(form.validated_data["repo_id"])
        return Response(
            ProjectSerializer(project, context={"request": request}).data,
            status=201 if created else 200,
        )

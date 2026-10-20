from rest_framework import viewsets, permissions
from .serializers import ProjectSerializer
from .services import project_queryset


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    lookup_field = "slug"

    def get_queryset(self):
        return project_queryset(self.request.user, self.request.query_params)

    def get_permissions(self):
        return (
            [permissions.AllowAny()]
            if self.action in ("list", "retrieve")
            else [permissions.IsAdminUser()]
        )


from .models import ProjectImage
from .serializers import ProjectImageSerializer


class GalleryViewSet(viewsets.ModelViewSet):
    queryset = ProjectImage.objects.all()
    serializer_class = ProjectImageSerializer

from rest_framework import viewsets, permissions
from .models import Technology
from .serializers import TechnologySerializer


class TechnologyViewSet(viewsets.ModelViewSet):
    queryset = Technology.objects.all()
    serializer_class = TechnologySerializer

    def get_permissions(self):
        return (
            [permissions.AllowAny()]
            if self.action in ("list", "retrieve")
            else [permissions.IsAdminUser()]
        )

from rest_framework import generics, permissions
from .models import SiteProfile
from .serializers import ProfileSerializer


class ProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer

    def get_object(self):
        return generics.get_object_or_404(SiteProfile, slug="main")

    def get_permissions(self):
        return (
            [permissions.AllowAny()]
            if self.request.method == "GET"
            else [permissions.IsAdminUser()]
        )

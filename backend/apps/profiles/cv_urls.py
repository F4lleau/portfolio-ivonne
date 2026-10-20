from django.urls import path
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound
from .models import SiteProfile
from .cv_service import build_cv


class CvView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, locale):
        if locale not in ("es", "en"):
            raise NotFound()
        profile = SiteProfile.objects.filter(slug="main").first()
        if profile is None:
            raise NotFound()
        response = HttpResponse(build_cv(profile, locale), content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="falleau-ivonne-cv-{locale}.pdf"'
        return response


urlpatterns = [path("<str:locale>/", CvView.as_view())]

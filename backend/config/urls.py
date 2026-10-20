from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.projects.views import GalleryViewSet
from apps.core.views import SessionView, LoginView, LogoutView
from apps.contact.views import MessageViewSet

router = DefaultRouter()
router.register("messages", MessageViewSet)
router.register("gallery", GalleryViewSet)
urlpatterns = [
    path("django-admin/", admin.site.urls),
    path("api/auth/session/", SessionView.as_view()),
    path("api/auth/login/", LoginView.as_view()),
    path("api/auth/logout/", LogoutView.as_view()),
    path("api/profile/", include("apps.profiles.urls")),
    path("api/projects/", include("apps.projects.urls")),
    path("api/technologies/", include("apps.technologies.urls")),
    path("api/contact/", include("apps.contact.urls")),
    path("api/assistant/", include("apps.assistant.urls")),
    path("api/github/", include("apps.github.urls")),
    path("api/cv/", include("apps.profiles.cv_urls")),
    path("api/admin/", include(router.urls)),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

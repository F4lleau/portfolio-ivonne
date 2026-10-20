from django.urls import path
from .views import GitHubView

urlpatterns = [path("", GitHubView.as_view())]

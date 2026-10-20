from rest_framework.routers import DefaultRouter
from .views import TechnologyViewSet

router = DefaultRouter()
router.register("", TechnologyViewSet)
urlpatterns = router.urls

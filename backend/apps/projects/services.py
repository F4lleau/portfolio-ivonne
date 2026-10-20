from django.db.models import Q
from .models import Project


def project_queryset(user, params):
    query = Project.objects.prefetch_related("technologies", "gallery").all()
    if not user.is_authenticated or not user.is_staff:
        query = query.filter(published=True)
    if params.get("q"):
        term = params["q"][:200]
        query = query.filter(
            Q(title__es__icontains=term)
            | Q(title__en__icontains=term)
            | Q(summary__es__icontains=term)
            | Q(summary__en__icontains=term)
        )
    if params.get("tech"):
        query = query.filter(technologies__slug=params["tech"])
    if params.get("category"):
        query = query.filter(category=params["category"])
    return query.distinct()

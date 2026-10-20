import uuid
from django.db import models


class Technology(models.Model):
    CATEGORIES = [(v, v) for v in ("frontend", "backend", "database", "ai", "devops", "tooling")]
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=80)
    category = models.CharField(max_length=20, choices=CATEGORIES)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["sort_order", "name"]

    def __str__(self):
        return self.name

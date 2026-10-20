import uuid
from django.db import models


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.SlugField(unique=True)
    title = models.JSONField()
    summary = models.JSONField()
    description = models.JSONField(default=dict)
    role = models.JSONField(default=dict)
    decisions = models.JSONField(default=dict)
    result = models.JSONField(default=dict)
    cover = models.ImageField(upload_to="project-covers/%Y/%m/", blank=True)
    cover_alt = models.CharField(max_length=240, blank=True)
    repo_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    year = models.PositiveIntegerField()
    category = models.CharField(
        max_length=20,
        choices=[(x, x) for x in ("frontend", "backend", "database", "ai", "devops", "fullstack")],
        default="fullstack",
    )
    featured = models.BooleanField(default=False)
    published = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    technologies = models.ManyToManyField(
        "technologies.Technology", related_name="projects", blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "-year"]
        indexes = [models.Index(fields=["published", "featured"])]

    def __str__(self):
        return self.title.get("es", self.slug)


class ProjectImage(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="gallery")
    image = models.ImageField(upload_to="project-covers/gallery/%Y/%m/")
    alt = models.CharField(max_length=240)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

import uuid
from django.db import models


class SiteProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    slug = models.CharField(max_length=10, unique=True, default="main", editable=False)
    full_name = models.CharField(max_length=120)
    headline = models.JSONField(default=dict)
    summary = models.JSONField(default=dict)
    availability = models.JSONField(default=dict)
    location = models.CharField(max_length=180, blank=True)
    timezone = models.CharField(max_length=80, default="America/Argentina/Buenos_Aires (UTC-3)")
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    linkedin_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    website_url = models.URLField(blank=True)
    photo = models.ImageField(upload_to="profile/", blank=True)
    languages = models.JSONField(default=list)
    experience = models.JSONField(default=list)
    education = models.JSONField(default=list)
    skills = models.JSONField(default=list)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.CheckConstraint(condition=models.Q(slug="main"), name="single_main_profile")
        ]

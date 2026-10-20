import os
from urllib.parse import urlparse
import requests
from django.utils.text import slugify
from rest_framework.exceptions import ValidationError, APIException
from apps.profiles.models import SiteProfile
from apps.projects.models import Project
from apps.technologies.models import Technology


def list_repositories():
    profile = SiteProfile.objects.get(slug="main")
    parsed = urlparse(profile.github_url)
    username = parsed.path.strip("/")
    if parsed.hostname != "github.com" or not username or "/" in username:
        raise ValidationError("Configure a valid GitHub profile URL first.")
    headers = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if os.getenv("GITHUB_TOKEN"):
        headers["Authorization"] = "Bearer " + os.environ["GITHUB_TOKEN"]
    rows = []
    try:
        for page in range(1, 11):
            response = requests.get(
                f"https://api.github.com/users/{username}/repos",
                params={"per_page": 100, "page": page, "sort": "updated", "type": "owner"},
                headers=headers,
                timeout=15,
            )
            response.raise_for_status()
            batch = response.json()
            rows.extend(
                {
                    "id": r["id"],
                    "name": r["name"],
                    "description": r.get("description") or "",
                    "url": r["html_url"],
                    "homepage": r.get("homepage") or "",
                    "language": r.get("language") or "",
                    "year": int(r["created_at"][:4]),
                    "fork": r["fork"],
                }
                for r in batch
                if not r["private"]
            )
            if len(batch) < 100:
                break
    except (requests.RequestException, ValueError, KeyError):
        raise APIException("GitHub is unavailable or its rate limit was reached. Try again later.")
    return rows


def import_repository(repo_id):
    row = next((r for r in list_repositories() if r["id"] == repo_id), None)
    if not row:
        raise ValidationError("Public repository not found on the configured GitHub profile.")
    existing = Project.objects.filter(repo_url=row["url"]).first()
    if existing:
        return existing, False
    slug = slugify(row["name"])[:45] or "github-project"
    if Project.objects.filter(slug=slug).exists():
        slug += "-" + str(row["id"])
    same = lambda value: {"es": value, "en": value}
    project = Project.objects.create(
        slug=slug,
        title=same(row["name"]),
        summary=same(row["description"]),
        description=same(row["description"]),
        role=same(""),
        decisions=same(""),
        result=same(""),
        repo_url=row["url"],
        demo_url=row["homepage"] if row["homepage"].startswith("https://") else "",
        year=row["year"],
    )
    tech = Technology.objects.filter(name__iexact=row["language"]).first()
    if tech:
        project.technologies.add(tech)
    return project, True

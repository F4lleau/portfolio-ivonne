import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.utils.text import slugify
from apps.technologies.models import Technology
from apps.projects.models import Project
from apps.profiles.models import SiteProfile


class Command(BaseCommand):
    help = "Load the CV data idempotently. Never overwrite existing edits."

    @transaction.atomic
    def handle(self, *args, **options):
        if connection.vendor == "postgresql":
            with connection.cursor() as cursor:
                cursor.execute("SELECT set_config('app.is_admin', 'true', true)")
        data = json.loads(
            (Path(__file__).resolve().parents[4] / "seed_data.json").read_text(encoding="utf-8")
        )
        for category, names in data["technologies"].items():
            for i, name in enumerate(names):
                Technology.objects.get_or_create(
                    slug=slugify(name),
                    defaults={"name": name, "category": category, "sort_order": i},
                )
        SiteProfile.objects.get_or_create(slug="main", defaults=data["profile"])
        for row in data["projects"]:
            stack = row.pop("stack")
            project, created = Project.objects.get_or_create(slug=row["slug"], defaults=row)
            if created:
                project.technologies.set(
                    Technology.objects.filter(slug__in=[slugify(name) for name in stack])
                )
        self.stdout.write(self.style.SUCCESS("Portfolio data ready. All initial cases are drafts."))

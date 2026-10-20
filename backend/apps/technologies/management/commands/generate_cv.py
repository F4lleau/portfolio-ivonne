from pathlib import Path
from django.core.management.base import BaseCommand
from apps.profiles.models import SiteProfile
from apps.profiles.cv_service import build_cv


class Command(BaseCommand):
    help = "Regenerate Spanish and English A4 PDFs from the current profile."

    def handle(self, *args, **options):
        profile = SiteProfile.objects.get(slug="main")
        folder = Path(__file__).resolve().parents[5] / "frontend" / "public" / "cv"
        folder.mkdir(parents=True, exist_ok=True)
        for locale in ("es", "en"):
            path = folder / f"falleau-ivonne-cv-{locale}.pdf"
            path.write_bytes(build_cv(profile, locale))
            self.stdout.write(str(path))

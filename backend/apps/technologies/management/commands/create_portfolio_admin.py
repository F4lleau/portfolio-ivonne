from getpass import getpass
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = "Create or update the sole portfolio administrator using hidden input."

    def handle(self, *args, **options):
        password = getpass("Admin password (hidden): ")
        if password != getpass("Repeat password: "):
            raise CommandError("Passwords do not match.")
        User = get_user_model()
        user, _ = User.objects.get_or_create(
            username=settings.ADMIN_EMAIL.lower(), defaults={"email": settings.ADMIN_EMAIL.lower()}
        )
        validate_password(password, user)
        user.is_staff = True
        user.is_superuser = True
        user.set_password(password)
        user.save()
        self.stdout.write(
            self.style.SUCCESS("Administrator ready. Public registration is disabled.")
        )

from django.core.management.base import BaseCommand, CommandError
from django.db import connection


class Command(BaseCommand):
    help = "Verify that the production PostgreSQL role actually enforces RLS."

    def handle(self, *args, **options):
        if connection.vendor != "postgresql":
            raise CommandError("SQLite is local-only. Configure a Neon PostgreSQL DATABASE_URL.")
        with connection.cursor() as cursor:
            cursor.execute("SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname=current_user")
            if any(cursor.fetchone()):
                raise CommandError(
                    "Runtime role must not have SUPERUSER or BYPASSRLS. Do not use neondb_owner."
                )
            cursor.execute(
                "SELECT relname,relrowsecurity,relforcerowsecurity FROM pg_class WHERE relname IN ('projects_project','projects_project_technologies','projects_projectimage','technologies_technology','profiles_siteprofile','contact_contactmessage')"
            )
            rows = cursor.fetchall()
            if len(rows) != 6 or any(not r[1] or not r[2] for r in rows):
                raise CommandError("Required RLS policies are not enabled/forced. Run migrations.")
        self.stdout.write(self.style.SUCCESS("Runtime role and forced RLS configuration verified."))

from django.db import migrations

TABLES = [
    "projects_project",
    "projects_project_technologies",
    "technologies_technology",
    "profiles_siteprofile",
    "contact_contactmessage",
]


def enable(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    admin = "COALESCE(current_setting('app.is_admin', true), 'false') = 'true'"
    for table in TABLES:
        schema_editor.execute(f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY")
        schema_editor.execute(f"ALTER TABLE {table} FORCE ROW LEVEL SECURITY")
        schema_editor.execute(
            f"CREATE POLICY admin_all ON {table} FOR ALL USING ({admin}) WITH CHECK ({admin})"
        )
    schema_editor.execute(
        "CREATE POLICY public_projects ON projects_project FOR SELECT USING (published = true)"
    )
    schema_editor.execute(
        "CREATE POLICY public_profile ON profiles_siteprofile FOR SELECT USING (slug = 'main')"
    )
    schema_editor.execute(
        "CREATE POLICY public_technologies ON technologies_technology FOR SELECT USING (true)"
    )
    schema_editor.execute(
        "CREATE POLICY public_project_tech ON projects_project_technologies FOR SELECT USING (EXISTS (SELECT 1 FROM projects_project p WHERE p.id = project_id AND p.published = true))"
    )
    schema_editor.execute(
        "CREATE POLICY public_contact ON contact_contactmessage FOR INSERT WITH CHECK (char_length(name) BETWEEN 2 AND 120 AND char_length(message) BETWEEN 10 AND 5000 AND locale IN ('es','en') AND is_read = false)"
    )


def disable(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    policies = {
        "projects_project": "public_projects",
        "projects_project_technologies": "public_project_tech",
        "technologies_technology": "public_technologies",
        "profiles_siteprofile": "public_profile",
        "contact_contactmessage": "public_contact",
    }
    for table in TABLES:
        schema_editor.execute(f"DROP POLICY IF EXISTS {policies[table]} ON {table}")
        schema_editor.execute(f"DROP POLICY IF EXISTS admin_all ON {table}")
        schema_editor.execute(f"ALTER TABLE {table} NO FORCE ROW LEVEL SECURITY")
        schema_editor.execute(f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY")


class Migration(migrations.Migration):
    dependencies = [
        ("projects", "0001_initial"),
        ("profiles", "0001_initial"),
        ("contact", "0001_initial"),
        ("technologies", "0001_initial"),
    ]
    operations = [migrations.RunPython(enable, disable)]

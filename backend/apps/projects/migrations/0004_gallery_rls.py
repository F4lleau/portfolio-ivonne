from django.db import migrations


def enable(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    schema_editor.execute("ALTER TABLE projects_projectimage ENABLE ROW LEVEL SECURITY")
    schema_editor.execute("ALTER TABLE projects_projectimage FORCE ROW LEVEL SECURITY")
    schema_editor.execute(
        "CREATE POLICY admin_all ON projects_projectimage FOR ALL USING (COALESCE(current_setting('app.is_admin',true),'false')='true') WITH CHECK (COALESCE(current_setting('app.is_admin',true),'false')='true')"
    )
    schema_editor.execute(
        "CREATE POLICY public_gallery ON projects_projectimage FOR SELECT USING (EXISTS (SELECT 1 FROM projects_project p WHERE p.id = project_id AND p.published = true))"
    )


def disable(apps, schema_editor):
    if schema_editor.connection.vendor != "postgresql":
        return
    schema_editor.execute("DROP POLICY IF EXISTS public_gallery ON projects_projectimage")
    schema_editor.execute("DROP POLICY IF EXISTS admin_all ON projects_projectimage")
    schema_editor.execute("ALTER TABLE projects_projectimage NO FORCE ROW LEVEL SECURITY")
    schema_editor.execute("ALTER TABLE projects_projectimage DISABLE ROW LEVEL SECURITY")


class Migration(migrations.Migration):
    dependencies = [("projects", "0003_projectimage")]
    operations = [migrations.RunPython(enable, disable)]

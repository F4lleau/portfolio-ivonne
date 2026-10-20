import secrets
from io import BytesIO
from unittest.mock import patch
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from PIL import Image
from rest_framework.test import APIClient
from apps.projects.models import Project
from apps.technologies.models import Technology
from apps.profiles.models import SiteProfile
from apps.contact.models import ContactMessage


class PortfolioTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_portfolio", verbosity=0)
        cls.password = secrets.token_urlsafe(24)
        cls.admin = get_user_model().objects.create_superuser(
            settings.ADMIN_EMAIL, settings.ADMIN_EMAIL, cls.password
        )
        cls.visitor = get_user_model().objects.create_user(
            "visitor@example.com", password=secrets.token_urlsafe(24)
        )

    def setUp(self):
        self.client = APIClient(enforce_csrf_checks=True)

    def csrf(self):
        response = self.client.get("/api/auth/session/")
        self.client.credentials(HTTP_X_CSRFTOKEN=response.data["csrfToken"])

    def as_admin(self):
        self.client.force_login(self.admin)
        self.csrf()

    def publish(self, slug="plataforma-ia"):
        project = Project.objects.get(slug=slug)
        project.published = True
        project.save()
        return project

    def test_seed_is_idempotent_and_drafts(self):
        call_command("seed_portfolio", verbosity=0)
        self.assertEqual(Project.objects.count(), 4)
        self.assertEqual(Technology.objects.count(), 41)
        self.assertFalse(Project.objects.filter(published=True).exists())

    def test_public_list_and_detail_never_expose_drafts(self):
        self.assertEqual(self.client.get("/api/projects/").data, [])
        self.assertEqual(self.client.get("/api/projects/plataforma-ia/").status_code, 404)
        self.publish()
        self.assertEqual(len(self.client.get("/api/projects/").data), 1)

    def test_admin_can_read_drafts(self):
        self.as_admin()
        self.assertEqual(len(self.client.get("/api/projects/").data), 4)

    def test_visitor_cannot_edit_profile_or_projects(self):
        self.client.force_login(self.visitor)
        self.csrf()
        self.assertEqual(
            self.client.patch(
                "/api/profile/", {"full_name": "intruder"}, format="json"
            ).status_code,
            403,
        )
        self.assertEqual(self.client.delete("/api/projects/ecommerce/").status_code, 403)

    def test_anonymous_cannot_read_messages(self):
        self.assertEqual(self.client.get("/api/admin/messages/").status_code, 403)

    def test_contact_requires_csrf(self):
        r = self.client.post(
            "/api/contact/",
            {"name": "Visitor", "email": "v@example.com", "message": "A real message here"},
            format="json",
        )
        self.assertEqual(r.status_code, 403)
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_contact_saves_but_does_not_return_private_data(self):
        self.csrf()
        r = self.client.post(
            "/api/contact/",
            {
                "name": "Visitor",
                "email": "v@example.com",
                "message": "A real message here",
                "locale": "en",
                "is_read": True,
            },
            format="json",
        )
        self.assertEqual(r.status_code, 201)
        self.assertEqual(r.data, {"saved": True})
        self.assertFalse(ContactMessage.objects.get().is_read)

    def test_contact_rejects_short_message_and_honeypot(self):
        self.csrf()
        for payload in [{"message": "short"}, {"website": "https://spam.example"}]:
            data = {"name": "Visitor", "email": "v@example.com", "message": "A proper message"}
            data.update(payload)
            self.assertEqual(
                self.client.post("/api/contact/", data, format="json").status_code, 400
            )
        self.assertEqual(ContactMessage.objects.count(), 0)

    def test_login_is_csrf_protected_and_rotates_session(self):
        self.assertEqual(
            self.client.post(
                "/api/auth/login/",
                {"email": settings.ADMIN_EMAIL, "password": self.password},
                format="json",
            ).status_code,
            403,
        )
        self.csrf()
        r = self.client.post(
            "/api/auth/login/",
            {"email": settings.ADMIN_EMAIL, "password": self.password},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertTrue(self.client.get("/api/auth/session/").data["authenticated"])

    def test_login_rejects_wrong_password(self):
        self.csrf()
        self.assertEqual(
            self.client.post(
                "/api/auth/login/",
                {"email": settings.ADMIN_EMAIL, "password": "wrong"},
                format="json",
            ).status_code,
            400,
        )

    def test_filters_search_technology_category(self):
        self.publish()
        self.publish("ecommerce")
        rows = self.client.get("/api/projects/?tech=python&category=ai&q=corporativa").data
        self.assertEqual([p["slug"] for p in rows], ["plataforma-ia"])

    def test_bot_only_matches_published_python_projects(self):
        self.publish()
        self.publish("ecommerce")
        self.csrf()
        r = self.client.post(
            "/api/assistant/",
            {
                "question": "Si hay algun proyecto con Python que indique cual y que se hizo",
                "locale": "es",
            },
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.assertEqual([p["url"] for p in r.data["projects"]], ["/projects/plataforma-ia"])
        self.assertNotIn("menu-multitenant", str(r.data))

    def test_bot_unknown_technology_does_not_invent_projects(self):
        self.publish()
        self.csrf()
        r = self.client.post("/api/assistant/", {"question": "Rust", "locale": "en"}, format="json")
        self.assertEqual(r.data["projects"], [])

    def test_publish_requires_bilingual_content_and_technology_count(self):
        self.as_admin()
        r = self.client.patch(
            "/api/projects/ecommerce/",
            {"published": True, "result": {"es": "", "en": ""}},
            format="json",
        )
        self.assertEqual(r.status_code, 400)
        r = self.client.patch(
            "/api/projects/ecommerce/", {"published": True, "technology_ids": []}, format="json"
        )
        self.assertEqual(r.status_code, 400)

    def test_profile_edit_is_used_by_cv_and_public_api(self):
        self.as_admin()
        self.assertEqual(
            self.client.patch(
                "/api/profile/", {"full_name": "Updated Profile"}, format="json"
            ).status_code,
            200,
        )
        self.assertEqual(self.client.get("/api/profile/").data["full_name"], "Updated Profile")
        from pypdf import PdfReader

        pdf = self.client.get("/api/cv/en/")
        self.assertEqual(pdf["Content-Type"], "application/pdf")
        reader = PdfReader(BytesIO(pdf.content))
        self.assertEqual(len(reader.pages), 2)
        self.assertIn("Updated Profile", reader.pages[0].extract_text())

    def test_profile_rejects_invalid_cv_structure(self):
        self.as_admin()
        self.assertEqual(
            self.client.patch(
                "/api/profile/", {"experience": [{"company": "incomplete"}]}, format="json"
            ).status_code,
            400,
        )

    def test_upload_rejects_html_filename(self):
        self.as_admin()
        image = BytesIO()
        Image.new("RGB", (12, 12)).save(image, format="PNG")
        payload = SimpleUploadedFile("unsafe.html", image.getvalue(), content_type="image/png")
        self.assertEqual(
            self.client.patch("/api/profile/", {"photo": payload}, format="multipart").status_code,
            400,
        )

    def test_admin_can_mark_and_delete_messages(self):
        message = ContactMessage.objects.create(
            name="Visitor", email="v@example.com", message="A real message here"
        )
        self.as_admin()
        self.assertEqual(
            self.client.patch(
                f"/api/admin/messages/{message.id}/", {"is_read": True}, format="json"
            ).status_code,
            200,
        )
        self.assertEqual(self.client.delete(f"/api/admin/messages/{message.id}/").status_code, 204)

    @patch("apps.github.services.requests.get")
    def test_github_import_is_draft_and_idempotent(self, get):
        get.return_value.json.return_value = [
            {
                "id": 123,
                "name": "real-repo",
                "description": "Original description",
                "html_url": "https://github.com/F4lleau/real-repo",
                "homepage": "",
                "language": "Python",
                "created_at": "2024-01-01",
                "fork": False,
                "private": False,
            }
        ]
        self.as_admin()
        for code in [201, 200]:
            r = self.client.post("/api/github/", {"repo_id": 123}, format="json")
            self.assertEqual(r.status_code, code)
            self.assertFalse(r.data["published"])
        self.assertEqual(Project.objects.filter(slug="real-repo").count(), 1)

    def test_github_endpoint_private_and_no_registration(self):
        self.assertEqual(self.client.get("/api/github/").status_code, 403)
        self.assertEqual(
            self.client.post("/api/auth/register/", {}, format="json").status_code, 404
        )

    def test_gallery_is_private_to_admin_and_follows_project_visibility(self):
        import tempfile
        from django.test import override_settings

        self.csrf()
        self.assertEqual(self.client.get("/api/admin/gallery/").status_code, 403)
        self.as_admin()
        with tempfile.TemporaryDirectory() as media, override_settings(MEDIA_ROOT=media):
            image = BytesIO()
            Image.new("RGB", (20, 20)).save(image, format="PNG")
            payload = SimpleUploadedFile(
                "screenshot.png", image.getvalue(), content_type="image/png"
            )
            project = Project.objects.get(slug="plataforma-ia")
            response = self.client.post(
                "/api/admin/gallery/",
                {
                    "project": str(project.id),
                    "image": payload,
                    "alt": "Project screenshot",
                    "sort_order": 0,
                },
                format="multipart",
            )
            self.assertEqual(response.status_code, 201)
            image_id = response.data["id"]
            public = APIClient()
            self.assertEqual(public.get("/api/projects/plataforma-ia/").status_code, 404)
            self.publish()
            self.assertEqual(
                public.get("/api/projects/plataforma-ia/").data["gallery"][0]["alt"],
                "Project screenshot",
            )
            self.assertEqual(self.client.delete(f"/api/admin/gallery/{image_id}/").status_code, 204)

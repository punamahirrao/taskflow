import shutil
import tempfile
from pathlib import Path

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APITestCase

from accounts.models import User

PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 32
TMP = Path(tempfile.mkdtemp())


@override_settings(PROFILE_PICS_ROOT=TMP)
class ProfileTests(APITestCase):
    @classmethod
    def tearDownClass(cls):
        super().tearDownClass()
        shutil.rmtree(TMP, ignore_errors=True)

    def setUp(self):
        self.user = User.objects.create_user(email="a@b.co", password="Str0ng-pass-1")
        self.client.force_authenticate(self.user)

    def test_update_profile_keeps_email_frozen(self):
        r = self.client.patch(
            "/accounts/me/",
            {"first_name": "Maya", "job_title": "PM", "department": "Product", "email": "x@y.co"},
            format="json",
        )
        self.assertEqual(r.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual((self.user.first_name, self.user.job_title), ("Maya", "PM"))
        self.assertEqual(self.user.email, "a@b.co")

    def test_photo_upload_replace_remove(self):
        def up():
            return SimpleUploadedFile("me.png", PNG, content_type="image/png")

        r = self.client.post("/accounts/me/photo/", {"photo": up()}, format="multipart")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(len(list(TMP.iterdir())), 1)
        served = self.client.get(r.data["photo_url"])
        self.assertEqual(served.status_code, 200)
        served.close()
        self.client.post("/accounts/me/photo/", {"photo": up()}, format="multipart")
        self.assertEqual(len(list(TMP.iterdir())), 1)
        r = self.client.delete("/accounts/me/photo/")
        self.assertIsNone(r.data["photo_url"])
        self.assertEqual(list(TMP.iterdir()), [])

    def test_rejects_non_image(self):
        bad = SimpleUploadedFile("x.png", b"not an image at all", content_type="image/png")
        r = self.client.post("/accounts/me/photo/", {"photo": bad}, format="multipart")
        self.assertEqual(r.status_code, 400)

    def test_change_password(self):
        body = {"current_password": "wrong", "new_password": "N3w-strong-pass", "confirm_password": "N3w-strong-pass"}
        self.assertEqual(self.client.post("/accounts/me/password/", body, format="json").status_code, 400)
        body["current_password"] = "Str0ng-pass-1"
        self.assertEqual(self.client.post("/accounts/me/password/", body, format="json").status_code, 200)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password("N3w-strong-pass"))

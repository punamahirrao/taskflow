from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import TypographyPreference, User
from accounts.organizations import create_organization


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class TypographyPreferenceTests(APITestCase):
    url = "/accounts/me/typography/"

    def setUp(self):
        self.user = User.objects.create_user(email="fonts@companies.test")
        self.first = create_organization(user=self.user, name="First Company")
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.use(self.first)

    def use(self, organization):
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
            HTTP_X_ORGANIZATION_ID=str(organization.id),
        )

    def test_default_font_and_size_and_persistent_application(self):
        self.assertEqual(
            self.client.get(self.url).json(), {"font_family": "", "font_size": 16}
        )
        self.assertFalse(TypographyPreference.objects.exists())
        response = self.client.put(
            self.url, {"font_family": "  Consolas  ", "font_size": 20}, format="json"
        )
        self.assertEqual(response.status_code, 200, response.content)
        self.assertEqual(response.json(), {"font_family": "Consolas", "font_size": 20})
        self.assertEqual(self.client.get(self.url).json(), response.json())

    def test_reset_keeps_one_record_and_restores_defaults(self):
        self.client.put(
            self.url, {"font_family": "Georgia", "font_size": 18}, format="json"
        )
        response = self.client.put(
            self.url, {"font_family": "", "font_size": 16}, format="json"
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            self.client.get(self.url).json(), {"font_family": "", "font_size": 16}
        )
        self.assertEqual(TypographyPreference.objects.count(), 1)

    def test_preferences_are_scoped_to_user_and_organization(self):
        choice = {"font_family": "Consolas", "font_size": 20}
        self.client.put(self.url, choice, format="json")
        second = create_organization(user=self.user, name="Second Company")
        self.use(second)
        self.assertEqual(
            self.client.get(self.url).json(), {"font_family": "", "font_size": 16}
        )
        self.client.put(
            self.url, {"font_family": "Georgia", "font_size": 18}, format="json"
        )
        colleague = User.objects.create_user(
            email="colleague@companies.test", active_organization=self.first
        )
        self.first.members.add(colleague)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(colleague).access_token}"
        )
        self.assertEqual(
            self.client.get(self.url).json(), {"font_family": "", "font_size": 16}
        )
        self.use(self.first)
        self.assertEqual(self.client.get(self.url).json(), choice)

    def test_invalid_size_and_font_name_are_rejected_without_saving(self):
        for size in (0, 11, 25, -1, 17.5, "large", None):
            with self.subTest(size=size):
                self.assertEqual(
                    self.client.put(
                        self.url,
                        {"font_family": "Arial", "font_size": size},
                        format="json",
                    ).status_code,
                    400,
                )
        for family in ("x" * 101, "Two\nlines", "Arial\x00bad", None):
            with self.subTest(family=family):
                self.assertEqual(
                    self.client.put(
                        self.url,
                        {"font_family": family, "font_size": 16},
                        format="json",
                    ).status_code,
                    400,
                )
        self.assertFalse(TypographyPreference.objects.exists())

    def test_anonymous_and_other_organizations_cannot_read_or_write(self):
        outsider = User.objects.create_user(email="outsider@companies.test")
        foreign = create_organization(user=outsider, name="Other Company")
        self.use(foreign)
        self.assertEqual(self.client.get(self.url).status_code, 403)
        self.assertEqual(
            self.client.put(
                self.url, {"font_family": "", "font_size": 16}, format="json"
            ).status_code,
            403,
        )
        self.client.credentials()
        self.assertEqual(self.client.get(self.url).status_code, 401)
        self.assertEqual(
            self.client.put(
                self.url, {"font_family": "", "font_size": 16}, format="json"
            ).status_code,
            401,
        )

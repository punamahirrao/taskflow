from django.test import override_settings
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import NavigationPreference, User
from accounts.organizations import create_organization


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class NavigationPreferenceTests(APITestCase):
    url = "/accounts/me/navigation/"

    def setUp(self):
        self.user = User.objects.create_user(email="menu@companies.test")
        self.first = create_organization(user=self.user, name="First Company")
        self.token = str(RefreshToken.for_user(self.user).access_token)
        self.use(self.first)

    def use(self, organization):
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
            HTTP_X_ORGANIZATION_ID=str(organization.id),
        )

    def test_defaults_do_not_create_records_and_saved_changes_survive_another_request(
        self,
    ):
        self.assertEqual(self.client.get(self.url).json(), {"items": {}})
        self.assertFalse(NavigationPreference.objects.exists())
        items = {
            "settings": {"label": "  Preferences  ", "icon": "star"},
            "roadmap": {"label": "Delivery plan", "icon": "compass"},
        }
        response = self.client.put(self.url, {"items": items}, format="json")
        self.assertEqual(response.status_code, 200, response.content)
        expected = {
            "items": {
                "settings": {"label": "Preferences", "icon": "star"},
                "roadmap": {"label": "Delivery plan", "icon": "compass"},
            }
        }
        self.assertEqual(response.json(), expected)
        self.assertEqual(self.client.get(self.url).json(), expected)
        self.assertEqual(
            NavigationPreference.objects.get().organization_id, self.first.id
        )
        self.assertEqual(NavigationPreference.objects.get().user_id, self.user.id)

    def test_preferences_are_isolated_between_organizations_for_the_same_user(self):
        items = {"settings": {"label": "First preferences", "icon": "star"}}
        self.client.put(self.url, {"items": items}, format="json")
        second = create_organization(user=self.user, name="Second Company")
        self.use(second)
        self.assertEqual(self.client.get(self.url).json(), {"items": {}})
        self.client.put(
            self.url, {"items": {"dashboard": {"label": "Second home"}}}, format="json"
        )
        self.use(self.first)
        self.assertEqual(self.client.get(self.url).json(), {"items": items})

    def test_preferences_are_isolated_between_users_in_the_same_organization(self):
        self.client.put(
            self.url,
            {"items": {"settings": {"label": "My preferences"}}},
            format="json",
        )
        colleague = User.objects.create_user(
            email="colleague@companies.test", active_organization=self.first
        )
        self.first.members.add(colleague)
        self.client.credentials(
            HTTP_AUTHORIZATION=f"Bearer {RefreshToken.for_user(colleague).access_token}"
        )
        self.assertEqual(self.client.get(self.url).json(), {"items": {}})
        self.client.put(
            self.url,
            {"items": {"settings": {"label": "Colleague preferences"}}},
            format="json",
        )
        self.use(self.first)
        self.assertEqual(
            self.client.get(self.url).json(),
            {"items": {"settings": {"label": "My preferences"}}},
        )

    def test_reset_replaces_customization_without_duplicate_records(self):
        self.client.put(
            self.url,
            {"items": {"settings": {"label": "Custom", "icon": "star"}}},
            format="json",
        )
        response = self.client.put(self.url, {"items": {}}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.client.get(self.url).json(), {"items": {}})
        self.assertEqual(NavigationPreference.objects.count(), 1)

    def test_invalid_names_icons_links_and_destinations_are_rejected(self):
        invalid = [
            {"settings": {"label": ""}},
            {"settings": {"label": "   "}},
            {"settings": {"label": "x" * 61}},
            {"settings": {"label": "Two\nlines"}},
            {"settings": {"icon": "unknown-icon"}},
            {"unknown-link": {"label": "Unknown"}},
            {"settings": {"path": "/users"}},
            {"settings": "name"},
        ]
        for items in invalid:
            with self.subTest(items=items):
                self.assertEqual(
                    self.client.put(
                        self.url, {"items": items}, format="json"
                    ).status_code,
                    400,
                )
        self.assertFalse(NavigationPreference.objects.exists())

    def test_non_member_and_anonymous_requests_cannot_access_preferences(self):
        outsider = User.objects.create_user(email="outsider@companies.test")
        foreign = create_organization(user=outsider, name="Other Company")
        self.use(foreign)
        self.assertEqual(self.client.get(self.url).status_code, 403)
        self.assertEqual(
            self.client.put(self.url, {"items": {}}, format="json").status_code, 403
        )
        self.client.credentials()
        self.assertEqual(self.client.get(self.url).status_code, 401)
        self.assertEqual(
            self.client.put(self.url, {"items": {}}, format="json").status_code, 401
        )

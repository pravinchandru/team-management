from django.test import TestCase
from django.core.exceptions import ValidationError
from ..models.team_member import TeamMember

class TeamMemberModelTest(TestCase):
    def setUp(self):
        self.team_member = TeamMember.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            phone_number="1234567890",
            role="regular"
        )

    def test_create_team_member(self):
        self.assertEqual(self.team_member.full_name(), "John Doe")
        self.assertEqual(self.team_member.email, "john@example.com")
        self.assertEqual(self.team_member.role, "regular")

    def test_full_name_method(self):
        self.assertEqual(self.team_member.full_name(), "John Doe")

    def test_string_representation(self):
        self.assertEqual(str(self.team_member), "John Doe")

    def test_team_member_roles(self):
        # Test regular role
        self.assertEqual(self.team_member.role, "regular")

        # Test admin role
        admin_member = TeamMember.objects.create(
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            phone_number="9876543210",
            role="admin"
        )
        self.assertEqual(admin_member.role, "admin")
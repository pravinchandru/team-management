from django.test import TestCase
from ..models.team_member import TeamMember
from ..serializers.team_member import TeamMemberSerializer

class TeamMemberSerializerTest(TestCase):
    def setUp(self):
        self.valid_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "john@example.com",
            "phone_number": "1234567890",
            "role": "regular"
        }
        self.serializer = TeamMemberSerializer(data=self.valid_data)

    def test_valid_data_serialization(self):
        self.assertTrue(self.serializer.is_valid())
        self.assertEqual(self.serializer.validated_data["first_name"], "John")
        self.assertEqual(self.serializer.validated_data["email"], "john@example.com")

    def test_invalid_email_format(self):
        invalid_data = self.valid_data.copy()
        invalid_data["email"] = "invalid-email"
        serializer = TeamMemberSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("email", serializer.errors)

    def test_duplicate_email_validation(self):
        # Create first team member
        self.assertTrue(self.serializer.is_valid())
        self.serializer.save()

        # Try to create another with same email
        duplicate_serializer = TeamMemberSerializer(data=self.valid_data)
        self.assertFalse(duplicate_serializer.is_valid())
        self.assertIn("email", duplicate_serializer.errors)

    def test_invalid_role(self):
        invalid_data = self.valid_data.copy()
        invalid_data["role"] = "invalid_role"
        serializer = TeamMemberSerializer(data=invalid_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn("role", serializer.errors)
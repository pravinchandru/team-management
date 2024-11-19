from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from ..models.team_member import TeamMember

class TeamMemberIntegrationTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.list_url = reverse('team-member-list')

    def test_full_team_member_workflow(self):
        # 1. Create a team member
        create_data = {
            "first_name": "John",
            "last_name": "Doe",
            "email": "johninteg@example.com",
            "phone_number": "1234567890",
            "role": "regular"
        }
        response = self.client.post(self.list_url, create_data, format='json')
        response_json = response.json()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        member_id = response_json['data']['id']

        # 2. Verify the member was created
        response = self.client.get(f'{self.list_url}{member_id}/')
        response_json = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response_json['data']['email'], 'johninteg@example.com')

        # 3. Update the member
        update_data = {
            "first_name": "John",
            "last_name": "Smith",
            "email": "johninteg@example.com",
            "phone_number": "1234567890",
            "role": "admin"
        }
        response = self.client.put(f'{self.list_url}{member_id}/', update_data, format='json')
        response_json = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response_json['data']['last_name'], 'Smith')

        # 4. Delete the member
        response = self.client.delete(f'{self.list_url}{member_id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 5. Verify deletion
        response = self.client.get(f'{self.list_url}{member_id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
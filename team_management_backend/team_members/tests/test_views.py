# team_members/tests/test_views.py
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from ..models.team_member import TeamMember

class TeamMemberViewTest(APITestCase):
    def setUp(self):
        self.team_member = TeamMember.objects.create(
            first_name="John",
            last_name="Doe",
            email="john@example.com",
            phone_number="1234567890",
            role="regular"
        )
        self.list_url = reverse('team-member-list')
        self.detail_url = reverse('team-member-detail', kwargs={'pk': self.team_member.id})

    def test_get_all_team_members(self):
        response = self.client.get(self.list_url)
        response_json = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response_json['status'], 'success')
        self.assertEqual(len(response_json['data']), 1)

    def test_create_team_member(self):
        data = {
            'first_name': 'Jane',
            'last_name': 'Doe',
            'email': 'jane@example.com',
            'phone_number': '9876543210',
            'role': 'regular'
        }
        response = self.client.post(self.list_url, data, format='json')
        response_json = response.json()
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response_json['status'], 'success')
        self.assertEqual(response_json['data']['email'], 'jane@example.com')


    def test_get_single_team_member(self):
        response = self.client.get(self.detail_url)
        response_json = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response_json['status'], 'success')
        self.assertEqual(response_json['data']['email'], 'john@example.com')

    def test_update_team_member(self):
        data = {
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'john@example.com',
            'phone_number': '1234567890',
            'role': 'admin'
        }
        response = self.client.put(self.detail_url, data, format='json')
        response_json = response.json()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response_json['status'], 'success')
        self.assertEqual(response_json['data']['last_name'], 'Smith')


    def test_partial_update_team_member(self):
        response = self.client.patch(self.detail_url, {'role': 'admin'}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_delete_team_member(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(TeamMember.objects.count(), 0)

    def test_create_invalid_team_member(self):
        invalid_payload = {
            'first_name': '',  # Empty first name should be invalid
            'last_name': 'Doe',
            'email': 'invalid-email',  # Invalid email format
            'phone_number': '1234567890',
            'role': 'invalid_role'  # Invalid role
        }
        response = self.client.post(self.list_url, invalid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
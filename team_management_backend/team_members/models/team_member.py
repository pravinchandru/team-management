# team_members/models/team_member.py
from django.db import models

class TeamMember(models.Model):
    ROLE_CHOICES = (
        ('regular', 'Regular'),
        ('admin', 'Admin'),
    )
    
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField()
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='regular')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        app_label = 'team_members'

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return self.full_name()
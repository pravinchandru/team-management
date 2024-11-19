# team_members/serializers/team_member.py
from rest_framework import serializers
from ..models.team_member import TeamMember

class TeamMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamMember
        fields = ['id', 'first_name', 'last_name', 'email', 'phone_number', 'role']

    def validate_email(self, value):
        """
        Check that the email is unique, considering updates
        """
        instance = self.instance  # Will be None for create operations
        if instance is not None:
            # If this is an update, exclude the current instance from the check
            exists = TeamMember.objects.exclude(pk=instance.pk).filter(email=value).exists()
        else:
            # If this is a create operation, check if email exists
            exists = TeamMember.objects.filter(email=value).exists()
        
        if exists:
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_role(self, value):
        """
        Check that the role is valid
        """
        valid_roles = dict(TeamMember.ROLE_CHOICES).keys()
        if value not in valid_roles:
            raise serializers.ValidationError(
                f"Invalid role. Must be one of: {', '.join(valid_roles)}"
            )
        return value

    def validate_phone_number(self, value):
        """
        Validate phone_number number format
        """
        if not value.isdigit():
            raise serializers.ValidationError(
                "Phone number must contain only digits."
            )
        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError(
                "Phone number must be between 10 and 15 digits."
            )
        return value

    def validate(self, data):
        """
        Object-level validation
        """
        if 'first_name' in data and not data['first_name'].strip():
            raise serializers.ValidationError(
                {"first_name": "First name cannot be empty."}
            )
        if 'last_name' in data and not data['last_name'].strip():
            raise serializers.ValidationError(
                {"last_name": "Last name cannot be empty."}
            )
        return data
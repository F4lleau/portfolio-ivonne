from rest_framework import serializers
from .models import ContactMessage


class ContactSerializer(serializers.ModelSerializer):
    name = serializers.CharField(min_length=2, max_length=120)
    message = serializers.CharField(min_length=10, max_length=5000)
    website = serializers.CharField(required=False, allow_blank=True, write_only=True)

    class Meta:
        model = ContactMessage
        fields = "__all__"
        read_only_fields = ["is_read", "created_at"]

    def validate_website(self, value):
        if value:
            raise serializers.ValidationError("Invalid submission.")
        return value

    def create(self, validated_data):
        validated_data.pop("website", None)
        return super().create(validated_data)


class MessageAdminSerializer(ContactSerializer):
    class Meta(ContactSerializer.Meta):
        read_only_fields = ["name", "email", "message", "locale", "created_at"]

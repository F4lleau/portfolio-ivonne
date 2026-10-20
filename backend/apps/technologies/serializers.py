from rest_framework import serializers
from .models import Technology


class TechnologySerializer(serializers.ModelSerializer):
    class Meta:
        model = Technology
        fields = "__all__"
        read_only_fields = ["created_at"]

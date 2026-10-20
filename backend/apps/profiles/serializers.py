from rest_framework import serializers
from apps.core.serializers import bilingual, image_upload
from .models import SiteProfile


class ProfileSerializer(serializers.ModelSerializer):
    headline = serializers.JSONField(validators=[bilingual])
    summary = serializers.JSONField(validators=[bilingual])
    availability = serializers.JSONField(validators=[bilingual])
    photo = serializers.ImageField(required=False, validators=[image_upload])

    class Meta:
        model = SiteProfile
        fields = "__all__"
        read_only_fields = ["slug", "updated_at"]

    def validate_languages(self, value):
        if not isinstance(value, list) or len(value) > 20:
            raise serializers.ValidationError("Expected a list of languages.")
        for item in value:
            if not isinstance(item, dict) or not isinstance(item.get("level"), str):
                raise serializers.ValidationError("Each language needs name and level.")
            bilingual(item.get("name"))
        return value

    def validate_experience(self, value):
        if not isinstance(value, list) or len(value) > 50:
            raise serializers.ValidationError("Expected a list of experience entries.")
        for item in value:
            if not isinstance(item, dict) or not all(
                isinstance(item.get(k), str) for k in ("company", "period")
            ):
                raise serializers.ValidationError("Each experience needs company and period.")
            bilingual(item.get("role"))
            bilingual(item.get("description"))
        return value

    def validate_education(self, value):
        if not isinstance(value, list) or len(value) > 50:
            raise serializers.ValidationError("Expected education list.")
        for item in value:
            if not isinstance(item, dict) or not all(
                isinstance(item.get(k), str) for k in ("school", "period")
            ):
                raise serializers.ValidationError("Each education entry needs school and period.")
            bilingual(item.get("title"))
            bilingual(item.get("status"))
        return value

    def validate_skills(self, value):
        if not isinstance(value, list) or len(value) > 20:
            raise serializers.ValidationError("Expected skills list.")
        for item in value:
            if (
                not isinstance(item, dict)
                or not isinstance(item.get("items"), list)
                or not all(isinstance(x, str) for x in item["items"])
            ):
                raise serializers.ValidationError("Each skill group needs name and items.")
            bilingual(item.get("name"))
        return value

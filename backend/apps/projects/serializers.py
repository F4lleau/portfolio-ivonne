from rest_framework import serializers
from apps.core.serializers import bilingual, image_upload
from apps.technologies.models import Technology
from apps.technologies.serializers import TechnologySerializer
from .models import Project, ProjectImage


class ProjectImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(validators=[image_upload])

    class Meta:
        model = ProjectImage
        fields = "__all__"


class ProjectSerializer(serializers.ModelSerializer):
    gallery = ProjectImageSerializer(many=True, read_only=True)
    technologies = TechnologySerializer(many=True, read_only=True)
    technology_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Technology.objects.all(),
        source="technologies",
        write_only=True,
        required=False,
    )
    title = serializers.JSONField(validators=[bilingual])
    summary = serializers.JSONField(validators=[bilingual])
    description = serializers.JSONField(validators=[bilingual], required=False)
    role = serializers.JSONField(validators=[bilingual], required=False)
    decisions = serializers.JSONField(validators=[bilingual], required=False)
    result = serializers.JSONField(validators=[bilingual], required=False)
    cover = serializers.ImageField(required=False, validators=[image_upload])

    class Meta:
        model = Project
        fields = "__all__"
        read_only_fields = ["created_at", "updated_at"]

    def validate(self, attrs):
        published = attrs.get("published", getattr(self.instance, "published", False))
        if published:
            for field in ("title", "summary", "description", "role", "result"):
                value = attrs.get(field, getattr(self.instance, field, {}))
                if not all(value.get(lang, "").strip() for lang in ("es", "en")):
                    raise serializers.ValidationError(
                        {field: "Complete español e inglés antes de publicar."}
                    )
            techs = attrs.get(
                "technologies", list(self.instance.technologies.all()) if self.instance else []
            )
            if not 3 <= len(techs) <= 6:
                raise serializers.ValidationError(
                    {"technology_ids": "Choose 3 to 6 technologies before publishing."}
                )
        return attrs

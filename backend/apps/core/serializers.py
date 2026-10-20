from rest_framework import serializers


def bilingual(value):
    if not isinstance(value, dict) or set(value) != {"es", "en"}:
        raise serializers.ValidationError('Use {"es": "...", "en": "..."}.')
    if any(not isinstance(v, str) or len(v) > 15000 for v in value.values()):
        raise serializers.ValidationError("Invalid bilingual text (maximum 15000 characters).")
    return value


def image_upload(value):
    from pathlib import Path

    if Path(value.name).suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp"):
        raise serializers.ValidationError("Use a .jpg, .png or .webp filename.")
    if value.size > 5 * 1024 * 1024:
        raise serializers.ValidationError("Maximum file size: 5 MB.")
    if getattr(value, "image", None) and value.image.format not in ("JPEG", "PNG", "WEBP"):
        raise serializers.ValidationError("Only JPEG, PNG and WebP images are accepted.")
    return value

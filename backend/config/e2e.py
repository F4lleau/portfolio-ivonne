from .settings import *

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR.parent / "tmp" / "e2e.sqlite3",
    }
}
EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
PASSWORD_HASHERS = ["django.contrib.auth.hashers.MD5PasswordHasher"]
DEBUG = True
REST_FRAMEWORK = {
    **REST_FRAMEWORK,
    "DEFAULT_THROTTLE_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {
        "anon": "10000/hour",
        "login": "10000/hour",
        "contact": "10000/hour",
        "assistant": "10000/hour",
    },
}
MEDIA_ROOT = BASE_DIR.parent / "tmp" / "e2e-media"

CSRF_TRUSTED_ORIGINS = ["http://127.0.0.1:5174"]

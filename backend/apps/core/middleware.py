from django.db import connection, transaction


class DatabaseRoleMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if connection.vendor != "postgresql":
            return self.get_response(request)
        # SET LOCAL is transaction-scoped, so pooled Neon connections cannot leak roles.
        with transaction.atomic():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT set_config('app.is_admin', %s, true)",
                    [
                        (
                            "true"
                            if request.user.is_authenticated and request.user.is_staff
                            else "false"
                        )
                    ],
                )
            return self.get_response(request)

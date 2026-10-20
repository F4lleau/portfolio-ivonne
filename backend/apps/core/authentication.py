from rest_framework.authentication import SessionAuthentication


class CsrfSessionAuthentication(SessionAuthentication):
    def authenticate(self, request):
        # DRF exempts API views from Django's CSRF middleware. Enforce for anonymous
        # login and contact too, not just authenticated mutations.
        if request.method not in ("GET", "HEAD", "OPTIONS"):
            self.enforce_csrf(request)
        return super().authenticate(request)

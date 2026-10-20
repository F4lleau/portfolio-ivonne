from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import ScopedRateThrottle
from rest_framework import serializers


class SessionView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        return Response(
            {
                "csrfToken": get_token(request),
                "authenticated": bool(request.user.is_authenticated and request.user.is_staff),
            }
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "login"

    def post(self, request):
        from django.conf import settings

        email = str(request.data.get("email", "")).strip().lower()
        password = request.data.get("password", "")
        if not isinstance(password, str) or len(password) > 256:
            raise serializers.ValidationError("Invalid credentials.")
        user = authenticate(request, username=email, password=password)
        if user is None or not user.is_staff or email != settings.ADMIN_EMAIL.lower():
            return Response(
                {"detail": "Email o contraseña incorrectos."}, status=status.HTTP_400_BAD_REQUEST
            )
        login(request, user)
        return Response({"authenticated": True, "csrfToken": get_token(request)})


class LogoutView(APIView):
    def post(self, request):
        logout(request)
        return Response({"authenticated": False})

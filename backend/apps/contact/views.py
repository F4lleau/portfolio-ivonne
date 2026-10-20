from django.db import transaction
from rest_framework import generics, viewsets, permissions
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from .models import ContactMessage
from .serializers import ContactSerializer, MessageAdminSerializer
from .services import notify_contact


class ContactView(generics.CreateAPIView):
    serializer_class = ContactSerializer
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "contact"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        message = serializer.save()
        transaction.on_commit(lambda: notify_contact(message.name, message.email, message.message))
        return Response({"saved": True}, status=201)


class MessageViewSet(viewsets.ModelViewSet):
    queryset = ContactMessage.objects.all()
    serializer_class = MessageAdminSerializer
    http_method_names = ["get", "patch", "delete", "head", "options"]

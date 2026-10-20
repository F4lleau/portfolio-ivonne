from rest_framework import serializers, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from .services import answer_question


class QuestionSerializer(serializers.Serializer):
    question = serializers.CharField(min_length=2, max_length=500)
    locale = serializers.ChoiceField(choices=["es", "en"], default="es")


class AssistantView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = "assistant"

    def post(self, request):
        serializer = QuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(answer_question(**serializer.validated_data))

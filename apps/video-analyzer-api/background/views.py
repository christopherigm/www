from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.viewsets import ModelViewSet
from background.models import Background
from background.serializers import BackgroundSerializer

class BackgroundViewSet(ModelViewSet):
    queryset = Background.objects.all()
    serializer_class = BackgroundSerializer
    # permission_classes = [IsAuthenticatedOrReadOnly]
    # authentication_classes = [SessionAuthentication, JWTAuthentication]
    permission_classes = []
    authentication_classes = []
    filterset_fields = {
        "id": ("exact", "in",),
        "enabled": ("exact",),
        "name": ("exact",),
        "uuid": ("exact",),
        "created": ("exact", "in",),
        "status": ("exact", "in",),
        "fps": ("exact", "in",),
        "author": ("exact",),
    }
    ordering = ("order", "id", "created")

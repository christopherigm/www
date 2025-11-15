from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.viewsets import ModelViewSet
from music.models import Music
from music.serializers import MusicSerializer

class MusicViewSet(ModelViewSet):
    queryset = Music.objects.all()
    serializer_class = MusicSerializer
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
        "author": ("exact",),
    }
    ordering = ("order", "id", "created")

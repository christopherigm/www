from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.viewsets import ModelViewSet
from video.models import Video, VideoAnalisys
from video.serializers import VideoSerializer, VideoAnalisysSerializer


class VideoViewSet(ModelViewSet):
    queryset = Video.objects.all()
    serializer_class = VideoSerializer
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
        "user": ("exact", "in",),
    }
    ordering = ("order", "id")


class VideoAnalisysViewSet(ModelViewSet):
    queryset = VideoAnalisys.objects.all()
    serializer_class = VideoAnalisysSerializer
    # permission_classes = [IsAuthenticatedOrReadOnly]
    # authentication_classes = [SessionAuthentication, JWTAuthentication]
    permission_classes = []
    authentication_classes = []
    filterset_fields = {
        "id": ("exact", "in",),
        "enabled": ("exact",),
        "video": ("exact",),
    }
    ordering = ("order", "id")

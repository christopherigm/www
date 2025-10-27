from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.viewsets import ModelViewSet
from common.models import BaseItemGalleryPicture
from common.serializers import BaseItemGalleryPictureSerializer


class BaseItemGalleryPictureViewSet(ModelViewSet):
    queryset = BaseItemGalleryPicture.objects.all()
    serializer_class = BaseItemGalleryPictureSerializer
    permission_classes = []
    # permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [
        JWTAuthentication,
        SessionAuthentication
    ]
    filterset_fields = {
        "id": ("exact", "in",),
        "enabled": ("exact",),
    }
    ordering = ("order", "id")

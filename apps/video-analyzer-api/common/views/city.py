from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.viewsets import ModelViewSet
from common.models import City
from common.serializers import CitySerializer

# Create your views here.


class CityViewSet (ModelViewSet):
    queryset = City.objects.all()
    serializer_class = CitySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [
        JWTAuthentication,
        SessionAuthentication
    ]
    ordering = ['id']
    ordering_fields = [
        'id', 'name', 'created', 'modified'
    ]
    filterset_fields = {
        'enabled': ('exact',),
        'id': ('exact', 'lt', 'gt', 'gte', 'lte'),
        'created': ('exact', 'lt', 'gt', 'gte', 'lte', 'in'),
        'modified': ('exact', 'lt', 'gt', 'gte', 'lte', 'in'),
        'name': ('exact', 'in'),
        'state': ('exact', 'in'),
        'state__name': ('exact', 'in'),
        'state__country': ('exact', 'in'),
        'state__country__name': ('exact', 'in'),
    }
    search_fields = ['name']

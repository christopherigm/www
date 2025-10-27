from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.viewsets import ModelViewSet
from common.models import Country
from common.serializers import CountrySerializer

# Create your views here.


class CountryViewSet (ModelViewSet):
    queryset = Country.objects.all()
    serializer_class = CountrySerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    authentication_classes = [
        JWTAuthentication,
        SessionAuthentication
    ]
    ordering = ['id']
    ordering_fields = '__all__'
    filterset_fields = {
        'enabled': ('exact',),
        'id': ('exact', 'lt', 'gt', 'gte', 'lte'),
        'created': ('exact', 'lt', 'gt', 'gte', 'lte', 'in'),
        'modified': ('exact', 'lt', 'gt', 'gte', 'lte', 'in'),
        'code': ('exact', 'in'),
        'name': ('exact', 'in')
    }
    search_fields = ['name', 'code']

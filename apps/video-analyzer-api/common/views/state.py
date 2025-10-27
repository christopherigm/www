from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.viewsets import ModelViewSet
from common.models import State
from common.serializers import StateSerializer

# Create your views here.


class StateViewSet (ModelViewSet):
    queryset = State.objects.all()
    serializer_class = StateSerializer
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
        'country': ('exact', 'in'),
        'country__name': ('exact', 'in'),
    }
    search_fields = ['name', 'country']

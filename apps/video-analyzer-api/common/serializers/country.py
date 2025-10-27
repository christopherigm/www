from rest_framework_json_api.serializers import HyperlinkedModelSerializer
from common.models import Country
from drf_extra_fields.fields import Base64ImageField


class CountrySerializer(HyperlinkedModelSerializer):
    img_flag = Base64ImageField(required=False)

    class Meta:
        model = Country
        fields = '__all__'

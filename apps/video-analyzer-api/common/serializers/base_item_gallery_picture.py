from rest_framework_json_api.serializers import HyperlinkedModelSerializer
from rest_framework_json_api.relations import ResourceRelatedField
from common.models import BaseItemGalleryPicture
from drf_extra_fields.fields import Base64ImageField


class BaseItemGalleryPictureSerializer(HyperlinkedModelSerializer):
    img_picture = Base64ImageField(required=False)

    class Meta:
        model = BaseItemGalleryPicture
        fields = "__all__"

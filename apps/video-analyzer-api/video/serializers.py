from rest_framework_json_api.serializers import HyperlinkedModelSerializer
from rest_framework_json_api.relations import ResourceRelatedField
from drf_extra_fields.fields import Base64ImageField
from video.models import Video, VideoAnalisys
from users.models import User


class VideoSerializer(HyperlinkedModelSerializer):
    user = ResourceRelatedField(queryset=User.objects, required=False)
    analysis = ResourceRelatedField(
        queryset=VideoAnalisys.objects,
        required=False,
        many=True
    )

    included_serializers = {
        'analysis': 'video.serializers.VideoAnalisysSerializer',
    }

    class Meta:
        model = Video
        fields = "__all__"


class VideoAnalisysSerializer(HyperlinkedModelSerializer):
    video = ResourceRelatedField(
        queryset=Video.objects,
        required=True,
    )

    class Meta:
        model = VideoAnalisys
        fields = "__all__"

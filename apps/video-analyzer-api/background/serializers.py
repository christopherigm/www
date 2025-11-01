from rest_framework_json_api.serializers import HyperlinkedModelSerializer
from background.models import Background

class BackgroundSerializer(HyperlinkedModelSerializer):

    class Meta:
        model = Background
        fields = "__all__"

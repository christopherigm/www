from rest_framework_json_api.serializers import HyperlinkedModelSerializer
from music.models import Music

class MusicSerializer(HyperlinkedModelSerializer):

    class Meta:
        model = Music
        fields = "__all__"

from django.contrib import admin
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.template.defaultfilters import escape
from video.models import Video, VideoAnalisys


# Register your models here.


class VideoAdmin(admin.ModelAdmin):
    list_display = [
        "video_link",
        "status",
        "tr_ready",
        "user",
        "ip_address",
        "interactions",
        "language",
        "name",
        "created"
    ]
    search_fields = ("name",)
    list_filter = (
        "user", 
        "ip_address",
        "status",
    )
    readonly_fields = ("version",)

    def video_link(self, obj):
        return obj.link[12:40]

    def interactions(self, obj):
        article_instance = VideoAnalisys.objects.filter(video=obj.id).count()
        return "{}".format(article_instance)

    def tr_ready(self, obj):
        ready = "Yes"
        if obj.transcriptions is None:
            ready = "No"
        return ready    
    
    interactions.allow_tags = True
    interactions.short_description = "Inter" 


admin.site.register(Video, VideoAdmin)


class VideoAnalisysAdmin(admin.ModelAdmin):
    list_display = [
        "video_link",
        "status",
        "video_ref",
        # "video__status",
        "worker_node",
        "time",
        "tr_ready",
        "video__user",
        "video__ip_address",
        "video__language",
        "created"
    ]
    search_fields = ("video",)
    list_filter = (
        "status",
        "worker_node",
        "video__status",
        "video__language",
        "video__user",
        "video__ip_address",
    )
    readonly_fields = ("version",)

    def video_link(self, obj):
        return obj.video.link[12:40]

    def tr_ready(self, obj):
        ready = "Yes"
        if obj.video.transcriptions is None:
            ready = "No"
        return ready

    def time(self, obj):
        if obj.ended is None or obj.started is None:
            return None
        return obj.ended - obj.started

    def video_ref(self, obj):
        return mark_safe('<a href="{}">{}</a>'.format(
            reverse(
                "admin:video_video_change",
                args=(obj.video.id,)
            ),
            obj.video.name
        ))
    
    video_ref.allow_tags = True
    video_ref.short_description = "Video" 

admin.site.register(VideoAnalisys, VideoAnalisysAdmin)
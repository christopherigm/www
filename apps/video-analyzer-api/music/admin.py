from django.contrib import admin
from music.models import Music


class MusicAdmin(admin.ModelAdmin):
    list_display = [
        "video_link",
        "status",
        "time_length",
        "author",
        "name",
        "created"
    ]
    search_fields = ("name",)
    list_filter = (
        "status",
    )
    readonly_fields = ("version",)

    def video_link(self, obj):
        return obj.link[12:40]


admin.site.register(Music, MusicAdmin)
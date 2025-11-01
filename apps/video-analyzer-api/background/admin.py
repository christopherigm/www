from django.contrib import admin
from background.models import Background


class BackgroundAdmin(admin.ModelAdmin):
    list_display = [
        "video_link",
        "status",
        "time_length",
        "fps",
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


admin.site.register(Background, BackgroundAdmin)
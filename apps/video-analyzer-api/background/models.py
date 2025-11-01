import uuid
from django.db import models
from common.models import CommonFields

class Background(CommonFields):
    status = models.CharField(
        max_length=16,
        null=True,
        blank=True,
        default='processing'
    )
    uuid = models.UUIDField(
        null=True,
        blank=True,
    )
    link = models.URLField(
        null=True,
        blank=True
    )
    local_link = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        default=''
    )
    time_length = models.PositiveSmallIntegerField(
        null=True,
        blank=True,
        default=60
    )
    fps = models.PositiveSmallIntegerField(
        null=True,
        blank=True
    )
    transition_duration = models.PositiveSmallIntegerField(
        null=True,
        blank=True
    )
    transition = models.CharField(
        max_length=16,
        null=True,
        blank=True,
        default=''
    )
    name = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        default=''
    )
    thumbnail = models.TextField(
        null=True,
        blank=True,
        default=''
    )
    author = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        default=''
    )
    logs = models.TextField(
        null=True,
        blank=True
    )

    def save(self, *args, **kwargs):
        if self.uuid is None:
            self.uuid = uuid.uuid4()
        super().save(*args, **kwargs)

    class JSONAPIMeta:
        resource_name = 'Background'

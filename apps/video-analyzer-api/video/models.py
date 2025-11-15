import uuid
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models
from common.tools import set_media_url, rotate_image
from django.db import models
from common.models import MediumPicture, CommonFields
from enum import Enum
from datetime import date


# Create your models here.

def picture(instance, filename):
    return set_media_url('video', filename)


class Video(MediumPicture):
    user = models.ForeignKey(
        'users.User',
        related_name='%(class)s_video',
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )
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
    local_link_sub = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        default=''
    )
    local_link_translated = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        default=''
    )
    local_link_translated_audio = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        default=''
    )

    podcast_name = models.CharField(
        max_length=32,
        null=True,
        blank=True,
        default=''
    )
    podcast_mood = models.CharField(
        max_length=32,
        null=True,
        blank=True,
        default=''
    )
    podcast_instrucctions = models.CharField(
        max_length=254,
        null=True,
        blank=True,
        default=''
    )
    podcast_length = models.CharField(
        max_length=16,
        null=True,
        blank=True,
        default='medium'
    )
    podcast_language = models.CharField(
        max_length=2,
        null=True,
        blank=True,
        default=''
    )
    podcast_script = models.TextField(
        null=True,
        blank=True
    )
    local_link_podcast = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        default=''
    )
    podcast_srt = models.TextField(
        null=True,
        blank=True
    )
    local_link_podcast_srt = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        default=''
    )
    local_link_podcast_video = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        default=''
    )
    podcast_diarization = models.TextField(
        null=True,
        blank=True
    )
    local_link_podcast_diarization = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        default=''
    )
    

    local_link_original_srt = models.CharField(
        max_length=256,
        null=True,
        blank=True,
        default=''
    )
    transcriptions = models.TextField(
        null=True,
        blank=True
    )
    clean_transcriptions = models.TextField(
        null=True,
        blank=True
    )
    translated_transcriptions = models.TextField(
        null=True,
        blank=True
    )
    translated_clean_transcriptions = models.TextField(
        null=True,
        blank=True
    )
    language = models.CharField(
        max_length=16,
        null=True,
        blank=True,
        default=''
    )
    requested_captions_language = models.CharField(
        max_length=16,
        null=True,
        blank=True,
        default=''
    )
    requested_subtitles_language = models.CharField(
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
    analysis = models.ManyToManyField(
        'video.VideoAnalisys',
        related_name='%(class)s_videos_analysis',
        blank=True
    )

    worker_node = models.CharField(
        max_length=8,
        null=True,
        blank=True,
        default=''
    )
    started=models.DateTimeField (
        null=True
    )
    ended=models.DateTimeField (
        null=True
    )
    ip_address = models.CharField(
        max_length=64,
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

    # class Meta:
    #     unique_together = (('user', 'created'),)

    class JSONAPIMeta:
        resource_name = 'Video'


@receiver(post_save, sender=Video, dispatch_uid="update_image")
def update_image(sender, instance, **kwargs):
    if instance.img_picture:
        rotate_image(instance.img_picture.url)


######### APP specifics #########



class VideoAnalisys(CommonFields):
    video = models.ForeignKey(
        'video.Video',
        related_name='%(class)s_from_video',
        null=False,
        blank=False,
        on_delete=models.CASCADE
    )
    status = models.CharField(
        max_length=16,
        null=True,
        blank=True,
        default='processing'
    )

    link = models.URLField(
        null=True,
        blank=True
    )
    
    worker_node = models.CharField(
        max_length=8,
        null=True,
        blank=True,
        default=''
    )
    started=models.DateTimeField (
        null=True
    )
    ended=models.DateTimeField (
        null=True
    )
    
    language = models.CharField(
        max_length=2,
        null=True,
        blank=True,
        default=''
    )

    prompt = models.TextField(
        null=True,
        blank=True
    )
    requested_characteristics = models.TextField(
        null=True,
        blank=True
    )

    summary = models.TextField(
        null=True,
        blank=True
    )

    logs = models.TextField(
        null=True,
        blank=True
    )

    viewed = models.BooleanField(
        null=True,
        blank=True
    )
    liked = models.BooleanField(
        null=True,
        blank=True
    )
    shared = models.BooleanField(
        null=True,
        blank=True
    )
    created = models.DateField(
        null=True,
        blank=True,
        default=date.today
    )

    # class Meta:
    #     unique_together = (('user', 'created'),)

    class JSONAPIMeta:
        resource_name = 'VideoAnalisys'

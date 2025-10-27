from django.db import models
from common.models import CommonFields
from common.tools import set_media_url
from django_resized import ResizedImageField
from colorfield.fields import ColorField


def picture(instance, filename):
    return set_media_url("CommonPicture", filename)


class BasePicture(CommonFields):
    name = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    description = models.TextField(
        null=True,
        blank=True
    )
    href = models.URLField(
        max_length=255,
        null=True,
        blank=True
    )
    full_size = models.BooleanField(
        blank=False,
        default=True
    )
    fit = models.CharField(
        max_length=16,
        null=True,
        blank=True,
        default='cover'
    )
    background_color = ColorField(
        null=True,
        blank=True,
        default='#fff'
    )

    class Meta:
        abstract = True


class SmallPicture(BasePicture):
    img_picture = ResizedImageField(
        null=True,
        blank=True,
        size=[256, None],
        quality=85,
        upload_to=picture
    )

    class Meta:
        abstract = True


class MediumPicture(BasePicture):
    img_picture = ResizedImageField(
        null=True,
        blank=True,
        size=[512, None],
        quality=85,
        upload_to=picture
    )

    class Meta:
        abstract = True


class RegularPicture(BasePicture):
    img_picture = ResizedImageField(
        null=True,
        blank=True,
        size=[1200, None],
        quality=85,
        upload_to=picture
    )

    class Meta:
        abstract = True


class LargePicture(BasePicture):
    img_picture = ResizedImageField(
        null=True,
        blank=True,
        size=[3840, None],
        quality=90,
        upload_to=picture
    )

    class Meta:
        abstract = True

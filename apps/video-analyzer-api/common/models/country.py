from django.db import models
from common.models import CommonFields
from common.validators import ModelValidators
from common.tools import set_media_url, rotate_image
from django_resized import ResizedImageField
from django.db.models.signals import post_save
from django.dispatch import receiver


def picture(instance, filename):
    return set_media_url('Country', filename)


class Country(CommonFields):
    name = models.CharField(
        max_length=255,
        null=False,
        blank=False,
        unique=True,
        validators=[
            ModelValidators.name,
        ]
    )
    code = models.CharField(
        max_length=2,
        null=False,
        blank=False,
        unique=True
    )
    phone_code = models.CharField(
        max_length=2,
        null=False,
        blank=False,
        unique=True
    )
    # https://pypi.org/project/django-resized/
    img_flag = ResizedImageField(
        null=True,
        blank=True,
        size=[128, 128],
        quality=100,
        upload_to=picture
    )

    def __str__(self):
        return "{0} ({1})".format(
            self.name,
            self.code
        )

    class JSONAPIMeta:
        resource_name = "Country"


@receiver(post_save, sender=Country, dispatch_uid="update_image")
def update_image(sender, instance, **kwargs):
    if instance.img_flag:
        rotate_image(instance.img_flag.url)

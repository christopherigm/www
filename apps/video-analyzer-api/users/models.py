import uuid
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db import models
from django.contrib.auth.models import AbstractUser
from django_resized import ResizedImageField
from common.tools import set_media_url, rotate_image
from colorfield.fields import ColorField
from django.db import models
from enum import Enum


def picture(instance, filename):
    return set_media_url('profile', filename)


class User(AbstractUser):
    token = models.UUIDField(
        null=True,
        blank=True,
        default=uuid.uuid4
    )
    img_picture = ResizedImageField(
        null=True,
        blank=True,
        size=[1200, None],
        quality=90,
        upload_to=picture
    )
    img_hero_picture = ResizedImageField(
        null=True,
        blank=True,
        size=[3840, None],
        quality=85,
        upload_to=picture
    )
    theme = models.CharField(
        max_length=16,
        null=False,
        blank=False,
        default='default'
    )
    theme_color = ColorField(
        default='#FF0000'
    )
    profile_picture_shape = models.CharField(
        max_length=16,
        null=False,
        blank=False,
        default='default'
    )

    ######### APP specifics #########
    sign = models.CharField(
        max_length=16,
        null=False,
        blank=False
    )
    dob = models.DateField(
        null=True,
        blank=True
    )
    favorite_animal = models.CharField(
        max_length=32,
        null=True,
        blank=True
    )
    gender = models.CharField(
        max_length=16,
        null=True,
        blank=True
    )
    custom_gender = models.CharField(
        max_length=16,
        null=True,
        blank=True
    )
    relationship = models.CharField(
        max_length=16,
        null=True,
        blank=True
    )
    language = models.CharField(
        max_length=2,
        null=True,
        blank=True,
        default='en'
    )
    ######### APP specifics #########

    def __str__(self):
        return self.username

    class JSONAPIMeta:
        resource_name = 'User'


@receiver(post_save, sender=User, dispatch_uid="update_image")
def update_image(sender, instance, **kwargs):
    if instance.img_picture:
        rotate_image(instance.img_picture.url)
    if instance.img_hero_picture:
        rotate_image(instance.img_hero_picture.url)


######### APP specifics #########

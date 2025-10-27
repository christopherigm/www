from django.db import models
from common.tools import rotate_image
from django.db.models.signals import post_save
from django.dispatch import receiver
from common.models import LargePicture


class BaseItemGalleryPicture(LargePicture):

    class JSONAPIMeta:
        resource_name = "BaseItemGalleryPicture"


@receiver(post_save, sender=BaseItemGalleryPicture, dispatch_uid="update_image")
def update_image(sender, instance, **kwargs):
    if instance.img_picture:
        rotate_image(instance.img_picture.url)

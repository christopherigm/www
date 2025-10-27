from django.db import models
from common.models import CommonFields
from common.validators import ModelValidators


class Address(CommonFields):
    alias = models.CharField(
        max_length=255,
        null=False,
        blank=False
    )
    receptor_name = models.CharField(
        null=True,
        blank=True,
        max_length=255,
        validators=[
            ModelValidators.name,
        ]
    )
    phone = models.CharField(
        null=True,
        blank=True,
        max_length=10,
        validators=[
            ModelValidators.us_phone,
        ]
    )
    zip_code = models.CharField(
        max_length=5,
        null=True,
        blank=True,
        validators=[
            ModelValidators.us_zip_code,
        ]
    )
    street = models.CharField(
        max_length=255,
        null=False,
        blank=False
    )
    neighborhood = models.CharField(
        max_length=128,
        null=True,
        blank=True,
    )
    ext_number = models.CharField(
        max_length=10,
        null=True,
        blank=True
    )
    int_number = models.CharField(
        max_length=10,
        null=True,
        blank=True
    )
    reference = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )

    class Meta:
        abstract = True

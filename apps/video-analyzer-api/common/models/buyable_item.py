from django.db import models
from common.models import RegularPicture


class BuyableItem(RegularPicture):
    slug = models.SlugField(
        null=True,
        blank=True,
        unique=True
    )
    short_description = models.CharField(
        max_length=255,
        verbose_name='Descripción corta',
        null=True,
        blank=True,
        help_text='Descripción corta (90 carácteres)'
    )
    stand = models.ForeignKey(
        'stand.Stand',
        related_name='%(class)s_stand',
        verbose_name='Empresa',
        null=True,
        blank=False,
        on_delete=models.CASCADE
    )
    pictures = models.ManyToManyField(
        'common.BaseItemGalleryPicture',
        related_name='%(class)s_picture',
        blank=True,
    )
    publish_on_the_wall = models.BooleanField(
        blank=False,
        default=False
    )
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=False,
        blank=False,
        default=5,
    )
    discount = models.PositiveSmallIntegerField(
        verbose_name='Descuento',
        null=True,
        blank=True,
        default=0,
        help_text='Descuento de 1% a 99%'
    )
    final_price = models.DecimalField(
        verbose_name='Precio final',
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        default=0
    )
    unlimited_stock = models.BooleanField(
        verbose_name='Stock ilimitado?',
        blank=False,
        default=False
    )
    stock = models.PositiveIntegerField(
        null=True,
        blank=True,
        default=0,
    )
    shipping_cost = models.PositiveIntegerField(
        null=True,
        blank=True,
        default=0,
    )
    video_link = models.URLField(
        max_length=255,
        null=True,
        blank=True
    )
    support_email = models.EmailField(
        null=True,
        blank=True,
    )
    support_info = models.TextField(
        null=True,
        blank=True,
    )
    support_phone = models.CharField(
        max_length=10,
        verbose_name='Teléfono de soporte',
        null=True,
        blank=True,
        help_text='Teléfono de soporte'
    )
    warranty_days = models.PositiveIntegerField(
        verbose_name='Días de garantía',
        null=False,
        blank=True,
        default=0,
        help_text='Días de garantía del producto'
    )
    times_selled = models.PositiveSmallIntegerField(
        verbose_name='Cantidad de veces vendido',
        null=False,
        blank=True,
        default=0
    )
    views = models.PositiveSmallIntegerField(
        verbose_name='Cantidad de veces visto',
        null=False,
        blank=True,
        default=0
    )

    def save(self, *args, **kwargs):
        final_price = float(self.price)

        discount = 0
        if self.discount is not None:
            discount = int(self.discount)

        if 99 > discount > 0:
            discount = discount / 100
            discount = discount * final_price
            final_price -= discount

        self.final_price = final_price

        if self.final_price > self.stand.products_max_price:
            self.stand.products_max_price = self.final_price
            self.stand.save()

        super().save(*args, **kwargs)

    def __str__(self):
        return "{0} - {1}".format(
            self.stand.name,
            self.name
        )

    class Meta:
        abstract = True

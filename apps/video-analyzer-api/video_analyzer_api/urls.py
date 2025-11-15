"""
URL configuration for video_analyzer_api project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from django.urls import re_path, include
from rest_framework import routers, permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)


from users.views import (
    UserViewSet,
    ActivateUser,
    ResetPassword,
    SetPassword,
)


from video.views import (
    VideoViewSet,
    VideoAnalisysViewSet,
)

from background.views import BackgroundViewSet

from music.views import MusicViewSet

router = routers.DefaultRouter()

router.register(r'users', UserViewSet)

router.register(r'videos', VideoViewSet)
router.register(r'video-analisys', VideoAnalisysViewSet)
router.register(r'backgrounds', BackgroundViewSet)
router.register(r'music', MusicViewSet)

# https://github.com/axnsan12/drf-yasg
schema_view = get_schema_view(
    openapi.Info(
        title='API Docs',
        default_version='v1',
        # description='',
        # terms_of_service='',
        contact=openapi.Contact(email='christopher.guzman.monsalvo@gmail.com'),
        license=openapi.License(name='GPL License'),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path(r'^v1/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    re_path(r'^v1/token/$', TokenObtainPairView.as_view(),
            name='token_obtain_pair'),
    re_path(r'^v1/token/refresh/$',
            TokenRefreshView.as_view(), name='token_refresh'),
    re_path(r'^v1/token/verify/$',
            TokenVerifyView.as_view(), name='token_verify'),
    re_path(r'^swagger(?P<format>\.json|\.yaml)$',
            schema_view.without_ui(cache_timeout=0), name='schema-json'),
    re_path(r'^swagger/$', schema_view.with_ui('swagger',
            cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^redoc/$', schema_view.with_ui('redoc',
            cache_timeout=0), name='schema-redoc'),
    re_path(r'^v1/activate-user', ActivateUser.as_view(), name='activate-user'),
    re_path(r'^v1/reset-password', ResetPassword.as_view(),
            name='reset-password'),
    re_path(r'^v1/set-password', SetPassword.as_view(), name='set-password'),
]


urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

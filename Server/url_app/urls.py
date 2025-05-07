from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import CustomTokenObtainPairView, UserRegisterView, UserViewSet, ShortenedURLViewSet, AdminDashboardViewSet, redirect_short_url

router = DefaultRouter()
router.register(r'users',UserViewSet,basename='user')
router.register(r'urls',ShortenedURLViewSet,basename='urls')

urlpatterns = [
    path('token/',CustomTokenObtainPairView.as_view(),name='token_obtain'),
    path('token/refresh/',TokenRefreshView.as_view(),name='refresh'),
    path('register/',UserRegisterView.as_view(),name='register'),
    path('admin-dashboard/',AdminDashboardViewSet.as_view(),name='admin-dashboard'),
    path('<str:short_code>/', redirect_short_url, name='redirect-short-url'),
] + router.urls

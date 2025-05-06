from webbrowser import get
from rest_framework import generics, permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from .serializers import CustomTokenObtainSerializer, ShortenedURLSerializer, UserRegisterSerializer, UserSerializer
from .permission import IsAdmin, IsOwnerOrAdmin
from url_app import serializers
from .models import ShortenedUrl

User = get_user_model()

class UserRegisterView(generics.CreateAPIView):
    """Register new user"""
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom view to obtain token with role"""
    serializer_class = CustomTokenObtainSerializer
    
class UserViewSet(viewsets.ModelViewSet):
    """Viewset for User"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    # def get_permissions(self):
    #     if self.action in ['update', 'partial_update', 'destroy' ]:
    #         return [IsAdmin()]
    #     elif self.action in ['retrieve', 'shortened_url']:
    #         return [permissions.IsAuthenticated()]
    #     return [IsAdmin()]
    
    def retrieve(self, request, *args, **kwargs):
        user = self.get_object()
        print("the user is ",user)
        if request.user != user and request.user.role != 'admin':
            return Response(
                {'detail': 'You can only view your own profile unless you are an admin'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().retrieve(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'])
    def public_urls(self, request):
        """Return all URLs for public exploration on the home page"""
        urls = ShortenedUrl.objects.all()
        serializer = ShortenedURLSerializer(urls, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def shortened_url(self, request, pk=None):
        """Return URLs that belong to a specific user"""
        user = self.get_object()
        
        # Add permission check similar to retrieve method
        if request.user != user and request.user.role != 'admin':
            return Response(
                {'detail': 'You can only view your own shortened URLs unless you are an admin'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        urls = user.shortened_urls.all()
        serializer = ShortenedURLSerializer(urls, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def block_user(self, request, pk):
        """Change the status of the user"""
        user = get_object_or_404(User, pk=pk)
        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        return Response({'message': f'User {"blocked" if not user.is_active else "unblocked"} successfully'}, status=200)

        
        
class ShortenedURLViewSet(viewsets.ModelViewSet):
    """View set for URL"""
    serializer_class = ShortenedURLSerializer
    queryset = ShortenedUrl.objects.all()
    
    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy' ]:
            return [IsOwnerOrAdmin()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(user = self.request.user)
        
    @action(detail=True, methods=['get'])
    def visit(self, request, pk = None):
        url = self.get_object()
        url.visit_count += 1
        url.save(update_fields=['visit_count'])
        return Response({'redirect_to':url.orginal_url})
    
class AdminDashboardViewSet(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
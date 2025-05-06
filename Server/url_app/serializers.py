from dataclasses import field
from statistics import mode
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import ShortenedUrl
from .utils import generate_short_code

User = get_user_model()

class CustomTokenObtainSerializer(TokenObtainPairSerializer):
    """Customised JWT token claim with user role"""
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        token['user_id'] = user.id
        token['username'] = user.username
        token['email'] = user.email
        token['role'] = user.role
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        data['role'] = self.user.role
        return data
    
class UserRegisterSerializer(serializers.ModelSerializer):
    """For registering the user"""
    class Meta:
        model = User
        fields = ('username', 'email', 'password')
        extra_kwargs = {
            'email':{'required':True},
            'password':{'write_only':True}
        }
        
    def create(self, validated_data):
        """hash password"""
        user = User.objects.create_user(**validated_data)
        return user
        
class UserSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'total_shortened_links', 'role', 'is_active')
        read_only_fields = ('role','total_shortened_links')
        
class ShortenedURLSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = ShortenedUrl
        fields = ('id','user','orginal_url','short_code','title','description','qr_code','visit_count','created_at','updated_at')
        read_only_fields = ('id','short_code','qr_code','visit_count','created_at','updated_at')
        
    def create(self, validated_data):
        validated_data['short_code'] = generate_short_code()
        return super().create(validated_data)
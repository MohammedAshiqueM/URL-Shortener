from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser,ShortenedUrl

admin.site.register(CustomUser,UserAdmin)
admin.site.register([ShortenedUrl])

from django.db import models
import os
from django.contrib.auth.models import AbstractUser
import qrcode
from io import BytesIO
from django.core.files import File
from PIL import Image
from dotenv import load_dotenv

load_dotenv()


class CustomUser(AbstractUser):
    """Extends User model with custom email filed(Unique) and URL tracking"""
    
    REGULAR = 'regular'
    ADMIN = 'admin'
    
    ROLE_CHOICES = [
        (REGULAR, 'Regular User'),
        (ADMIN, 'Admin User')
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20,choices=ROLE_CHOICES, default=REGULAR)
    
    @property
    def total_shortened_links(self):
        """Returened shourtened urls made by this user"""
        return self.shortened_urls.count()
    
    def __str__(self):
        return self.email
    
class ShortenedUrl(models.Model):
    """Model for shortened URLs"""
    user = models.ForeignKey(CustomUser,on_delete=models.CASCADE,related_name='shortened_urls')
    orginal_url = models.URLField(max_length=500)
    short_code = models.CharField(max_length=10,unique=True)
    title = models.CharField(max_length=500,blank=True)
    description = models.TextField(blank=True)
    qr_code = models.ImageField(upload_to='qr_codes/',blank=True)
    visit_count = models.PositiveBigIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    
    def save(self, *args, **kwargs):
        """Override save to generate QR code"""
        if not self.qr_code:
            self.generate_qr_code()
        super().save(*args, **kwargs)
        
    def generate_qr_code(self):
        """Generate QR code for shortened URL"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4
        )
        site_domain = os.getenv('base_url')
        qr.add_data(f"{site_domain}/{self.short_code}")
        qr.make(fit=True)
        
        img = qr.make_image(fill_color='black', back_color='white')
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        
        self.qr_code.save(
            f"{self.short_code}.png",
            File(buffer),
            save=False
        )

    def increment_visit_count(self):
        """Increment the URLs visit count"""
        self.visit_count += 1
        self.save(update_fields=['visit_count'])
        
    def __str__(self):
        return f"{self.short_code} -> {self.orginal_url}"
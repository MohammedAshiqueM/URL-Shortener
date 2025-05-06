import string
import random
from .models import ShortenedUrl

def generate_short_code(length=6):
    """Generate random short code for URL"""
    chars = string.ascii_letters + string.digits
    code = ''.join((random.choice(chars) for _ in range(length)))
    
    while ShortenedUrl.objects.filter(short_code=code).exists():
        code = ''.join((random.choice(chars) for _ in range(length)))
    
    return code
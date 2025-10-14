"""Common validators"""

import re
from django.core.exceptions import ValidationError

def validate_phone_number(value):
    """Validate Philippine phone number format"""
    pattern = r'^(\+63|0)?[0-9]{10}$'
    if not re.match(pattern, value):
        raise ValidationError('Invalid phone number format. Use format: 09171234567')

def validate_ministry_access(user, ministry):
    """Check if user has access to ministry"""
    if user.role == 'ministry_leader':
        return user.led_ministries.filter(id=ministry.id).exists()
    return user.role in ['admin', 'pastor']

def validate_email_domain(value):
    """Validate email domain (optional: restrict to church domain)"""
    # For now, just check basic format
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(pattern, value):
        raise ValidationError('Invalid email format')
import os

import django
from django.conf import settings
from django.core.mail import send_mail

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sbcc.settings")
django.setup()

print("📧 Testing Email Configuration...")
print(f"Email Backend: {settings.EMAIL_BACKEND}")
print(f"SMTP Host: {settings.EMAIL_HOST}")
print(f"SMTP Port: {settings.EMAIL_PORT}")
print(f"From Email: {settings.DEFAULT_FROM_EMAIL}")
print(f"Host User: {settings.EMAIL_HOST_USER}")
print()

try:
    send_mail(
        subject="Test Email from SBCC Management System",
        message="This is a test email to verify SMTP configuration is working correctly.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.EMAIL_HOST_USER],
        fail_silently=False,
    )
    print("✅ Email sent successfully!")
    print(f"Check {settings.EMAIL_HOST_USER} for the test email.")
except Exception as e:
    print(f"❌ Failed to send email: {e}")

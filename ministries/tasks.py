# apps/ministries/tasks.py
from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import Assignment
from .utils.notification import send_assignment_email

@shared_task
def send_upcoming_reminders(hours_before=24):
    today = timezone.now().date()
    window_end = today + timedelta(days=2)
    assignments = Assignment.objects.filter(shift__date__gte=today, shift__date__lte=window_end, reminded=False)
    for a in assignments:
        # if shift within hours_before hours
        # simple date-based check: if shift.date - now <= hours_before hours
        send_assignment_email(a)  # or send a different reminder template
        a.reminded = True
        a.save()

@shared_task
def test_task():
    print("Celery is working!")
    return "ok"
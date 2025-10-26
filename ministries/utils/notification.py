from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

def send_assignment_email(assignment):
    user = assignment.user
    shift = assignment.shift
    subject = f"You've been assigned: {shift.ministry.name} - {shift.role} on {shift.date}"
    body = render_to_string('emails/assignment_notification.txt', {
        'user': user,
        'shift': shift,
    })
    send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
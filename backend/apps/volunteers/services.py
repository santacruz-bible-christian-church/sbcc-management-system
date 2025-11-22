from django.utils import timezone
from .models import Volunteer, Event, Assignment, Availability
from django.db import transaction
from django.core.exceptions import ValidationError
from typing import Optional, List
from datetime import datetime, time

def check_event_capacity(event: Event) -> bool:
    """Return True if the event has room for more confirmed volunteers."""
    return event.confirmed_count < event.capacity

def is_volunteer_available_for_event(volunteer: Volunteer, event: Event) -> bool:
    """
    Basic check: volunteer has Availability for event.date overlapping event time.
    This is conservative — you can extend to weekly repeating availability, timezone mapping, etc.
    """
    event_date = event.start.date()
    availabilities = Availability.objects.filter(volunteer=volunteer, date=event_date)
    if not availabilities.exists():
        return False
    for a in availabilities:
        if (a.start_time <= event.start.time() and a.end_time >= event.end.time()) or \
           (a.start_time <= event.start.time() <= a.end_time) or \
           (a.start_time <= event.end.time() <= a.end_time):
            return True
    return False

@transaction.atomic
def assign_volunteer_to_event(volunteer: Volunteer, event: Event, role=None, force=False) -> Assignment:
    """
    Try to create an assignment. Raises ValidationError on failure.
    If force=True, skip capacity / availability checks (admin override).
    """
    if Assignment.objects.filter(volunteer=volunteer, event=event).exists():
        raise ValidationError("Volunteer is already assigned to this event.")

    if not force:
        if not volunteer.is_active:
            raise ValidationError("Volunteer is not active.")
        if not check_event_capacity(event):
            raise ValidationError("Event capacity reached.")
        if not is_volunteer_available_for_event(volunteer, event):
            raise ValidationError("Volunteer does not appear available for the event date/time.")

    assignment = Assignment.objects.create(
        volunteer=volunteer,
        event=event,
        role=role,
        status=Assignment.Status.PENDING,
    )
    return assignment

def confirm_assignment(assignment: Assignment) -> Assignment:
    """Mark assignment as confirmed if capacity allows. Raises ValidationError otherwise."""
    if assignment.status == Assignment.Status.CONFIRMED:
        return assignment
    if assignment.event.confirmed_count >= assignment.event.capacity:
        raise ValidationError("Cannot confirm — event at capacity.")
    assignment.status = Assignment.Status.CONFIRMED
    assignment.responded_at = timezone.now()
    assignment.save()
    # TODO:
    return assignment

def decline_assignment(assignment: Assignment) -> Assignment:
    assignment.status = Assignment.Status.DECLINED
    assignment.responded_at = timezone.now()
    assignment.save()
    # TODO:
    return assignment

def get_available_volunteers_for_event(event: Event, roles: Optional[List[int]] = None):
    """
    Return volunteers who are active and available on event date.
    Optionally filter by role ids.
    """
    from django.db.models import Q
    candidates = Volunteer.objects.filter(is_active=True)
    if roles:
        candidates = candidates.filter(roles__in=roles).distinct()
    date = event.start.date()
    avail_ids = Availability.objects.filter(date=date).values_list("volunteer_id", flat=True)
    return candidates.filter(id__in=avail_ids)

def notify_volunteer_assignment(assignment: Assignment, method="email"):
    """
    This function should implement actual sending of an email / SMS / push notification.
    Here it's a stub for integration.
    """
    return True

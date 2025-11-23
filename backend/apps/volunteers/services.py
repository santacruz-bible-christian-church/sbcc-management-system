from datetime import datetime
from django.utils import timezone
from .models import Volunteer, Event, Assignment, Availability, Rotation, RotationMember
from django.db import transaction
from django.core.exceptions import ValidationError
from typing import Optional, List
from datetime import datetime, time

def check_event_capacity(event: Event) -> bool:
    return event.confirmed_count < event.capacity

def is_volunteer_available_for_event(volunteer: Volunteer, event: Event) -> bool:
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

def _eligible_member_iter(rotation: Rotation, role: Optional[Role], event: Event):
    members = rotation.members.select_related("volunteer").all().order_by("last_assigned", "-priority", "volunteer__last_name")
    for member in members:
        v = member.volunteer

        if not v.is_active:
            continue

        if Assignment.objects.filter(volunteer=v, event=event).exists():
            continue

        if rotation.role and rotation.role not in v.roles.all():
            pass

        if not is_volunteer_available_for_event(v, event):
            continue
        yield member

def confirm_assignment(assignment: Assignment) -> Assignment:
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
    from django.db.models import Q
    candidates = Volunteer.objects.filter(is_active=True)
    if roles:
        candidates = candidates.filter(roles__in=roles).distinct()
    date = event.start.date()
    avail_ids = Availability.objects.filter(date=date).values_list("volunteer_id", flat=True)
    return candidates.filter(id__in=avail_ids)

def notify_volunteer_assignment(assignment: Assignment, method="email"):
    return True

@transaction.atomic
def run_rotation_for_event(rotation: Rotation, event: Event, role=None, count: int = 1, force=False):

    created = []
    available_slots = max(0, event.capacity - event.assignments.filter(status=Assignment.Status.CONFIRMED).count())
    if available_slots <= 0 and not force:
        raise ValidationError("Event has no available capacity to assign from rotation.")
    to_fill = min(count, available_slots) if not force else count

    member_iter = _eligible_member_iter(rotation, role, event)
    for member in member_iter:
        if len(created) >= to_fill:
            break
        volunteer = member.volunteer
        try:
            assignment = assign_volunteer_to_event(volunteer, event, role=role, force=force)
        except ValidationError:
            continue

        member.last_assigned = timezone.now()
        member.save(update_fields=["last_assigned"])
        created.append(assignment)
    return created

def auto_schedule_events_using_rotations(start_date=None, end_date=None):
    from django.db.models import Q
    qs = Event.objects.all()
    if start_date:
        qs = qs.filter(start__date__gte=start_date)
    if end_date:
        qs = qs.filter(start__date__lte=end_date)

    summary = {}
    for event in qs:
        assigned_total = 0
        roles = event.required_roles.all()
        if roles.exists():
            for role in roles:
                rotations = Rotation.objects.filter(role=role)
                if not rotations.exists():
                    continue
                rot = rotations.first()
                created = run_rotation_for_event(rot, event, role=role, count=1)
                assigned_total += len(created)
        else:
            rotations = Rotation.objects.filter(role__isnull=True)
            for rot in rotations:
                if assigned_total >= event.capacity:
                    break
                created = run_rotation_for_event(rot, event, count=1)
                assigned_total += len(created)

        summary[event.id] = {"title": event.title, "assigned": assigned_total}
    return summary
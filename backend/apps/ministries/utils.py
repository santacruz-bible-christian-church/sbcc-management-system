from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from .models import Assignment, MinistryMember, Shift


def rotate_and_assign(ministry_ids=None, days=7, dry_run=False, notify=False, limit_per_ministry=0):
    """
    Rotate and assign shifts for ministries.

    Args:
        ministry_ids: List of ministry IDs (None = all ministries)
        days: Number of days ahead to look for shifts
        dry_run: If True, don't actually create assignments
        notify: If True, send email notifications
        limit_per_ministry: Max assignments per ministry (0 = unlimited)

    Returns:
        dict: Summary with created, emailed, skipped_no_members, errors
    """
    summary = {"created": 0, "emailed": 0, "skipped_no_members": [], "errors": []}

    today = timezone.now().date()
    end_date = today + timedelta(days=days)

    shifts_qs = Shift.objects.filter(date__gte=today, date__lte=end_date, assignment__isnull=True)

    if ministry_ids is not None:
        shifts_qs = shifts_qs.filter(ministry_id__in=list(ministry_ids))

    shifts = shifts_qs.select_related("ministry").order_by("date", "ministry_id")

    if not shifts.exists():
        return summary

    # Group shifts by ministry_id
    shifts_by_ministry = {}
    for s in shifts:
        shifts_by_ministry.setdefault(s.ministry_id, []).append(s)

    for ministry_id, shifts_list in shifts_by_ministry.items():
        # Fetch active members
        members = list(
            MinistryMember.objects.filter(ministry_id=ministry_id, is_active=True).select_related(
                "user"
            )
        )

        if not members:
            summary["skipped_no_members"].append(ministry_id)
            continue

        # Determine last assignment time per member (for this ministry)
        member_last_assigned = {}
        for mem in members:
            last = (
                Assignment.objects.filter(user=mem.user, shift__ministry_id=ministry_id)
                .order_by("-assigned_at")
                .first()
            )
            member_last_assigned[mem.user.pk] = last.assigned_at if last else None

        # Sort members so least-recently assigned come first (None => never assigned)
        # FIXED: Make timezone-aware
        members_sorted = sorted(
            members,
            key=lambda m: (
                member_last_assigned.get(m.user.pk)
                or timezone.datetime.min.replace(tzinfo=timezone.utc),
                m.pk,
            ),
        )

        rot_index = 0
        created_for_ministry = 0

        for shift in shifts_list:
            if limit_per_ministry and created_for_ministry >= limit_per_ministry:
                break

            assigned_member = members_sorted[rot_index % len(members_sorted)]
            rot_index += 1

            assignment = None
            if not dry_run:
                try:
                    with transaction.atomic():
                        assignment = Assignment.objects.create(
                            shift=shift, user=assigned_member.user
                        )
                        summary["created"] += 1
                        created_for_ministry += 1
                except Exception as exc:
                    summary["errors"].append(
                        f"Failed to create assignment for shift {shift.pk}: {exc}"
                    )
                    continue

            # Send notification if requested
            if notify and assignment and not dry_run:
                try:
                    _send_assignment_notification(assignment, shift, assigned_member)
                    assignment.notified = True
                    assignment.save(update_fields=["notified"])
                    summary["emailed"] += 1
                except Exception as exc:
                    summary["errors"].append(f"Failed to email {assigned_member.user.email}: {exc}")

    return summary


def _send_assignment_notification(assignment, shift, ministry_member):
    """Send email notification for new assignment."""
    user = ministry_member.user
    subj = f"Assigned: {shift.role} on {shift.date}"

    # IMPROVED: Include start/end time
    body = (
        f"Hello {user.first_name or user.username},\n\n"
        f"You have been assigned to '{shift.role}' for the ministry "
        f"'{shift.ministry.name}' on {shift.date}.\n\n"
        f"Details:\n"
        f"  Ministry: {shift.ministry.name}\n"
        f"  Role: {shift.role}\n"
        f"  Date: {shift.date}\n"
    )

    if shift.start_time:
        body += f"  Start Time: {shift.start_time.strftime('%I:%M %p')}\n"
    if shift.end_time:
        body += f"  End Time: {shift.end_time.strftime('%I:%M %p')}\n"

    body += "\nIf you cannot serve, please contact your ministry leader immediately.\n"

    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@sbcc.church")
    send_mail(subj, body, from_email, [user.email], fail_silently=False)

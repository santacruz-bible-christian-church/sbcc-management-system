from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings

from .models import Shift, MinistryMember, Assignment, Ministry

def rotate_and_assign(ministry_ids=None, days=7, dry_run=False, notify=False, limit_per_ministry=0):
    summary = {'created': 0, 'emailed': 0, 'skipped_no_members': [], 'errors': []}

    today = timezone.now().date()
    end_date = today + timedelta(days=days)

    shifts_qs = Shift.objects.filter(date__gte=today, date__lte=end_date, assignment__isnull=True)
    if ministry_ids is not None:
        shifts_qs = shifts_qs.filter(ministry_id__in=list(ministry_ids))

    shifts = shifts_qs.select_related('ministry').order_by('date', 'ministry_id')

    if not shifts.exists():
        return summary

    # group shifts by ministry_id
    shifts_by_ministry = {}
    for s in shifts:
        shifts_by_ministry.setdefault(s.ministry_id, []).append(s)

    for ministry_id, shifts_list in shifts_by_ministry.items():
        # fetch active members
        members = list(
            MinistryMember.objects.filter(ministry_id=ministry_id, is_active=True)
            .select_related('user')
        )
        if not members:
            summary['skipped_no_members'].append(ministry_id)
            continue

        # determine last assignment time per member (for this ministry)
        member_last_assigned = {}
        for mem in members:
            last = Assignment.objects.filter(user=mem.user, shift__ministry_id=ministry_id).order_by('-assigned_at').first()
            member_last_assigned[mem.user.pk] = last.assigned_at if last else None

        # sort members so least-recently assigned come first (None => never assigned)
        members_sorted = sorted(members, key=lambda m: (member_last_assigned.get(m.user.pk) or timezone.datetime.min, m.pk))

        rot_index = 0
        created_for_ministry = 0

        for shift in shifts_list:
            if limit_per_ministry and created_for_ministry >= limit_per_ministry:
                break

            assigned_member = members_sorted[rot_index % len(members_sorted)]
            rot_index += 1

            if not dry_run:
                try:
                    with transaction.atomic():
                        assignment = Assignment.objects.create(shift=shift, user=assigned_member.user)
                        summary['created'] += 1
                        created_for_ministry += 1
                except Exception as exc:
                    summary['errors'].append(f"Failed to create assignment for shift {shift.pk}: {exc}")
                    continue
            else:
                assignment = None  # no persisted object on dry-run

            # send notification if requested
            if notify and (not dry_run):
                try:
                    subj = f"Assigned: {shift.role} on {shift.date}"
                    body = (
                        f"Hello {getattr(assigned_member.user, 'first_name', '') or assigned_member.user},\n\n"
                        f"You have been assigned to *{shift.role}* for the ministry *{shift.ministry.name}* on {shift.date}.\n\n"
                        f"Details:\n  Ministry: {shift.ministry.name}\n  Role: {shift.role}\n  Date: {shift.date}\n\n"
                        "If you cannot serve, please contact your ministry leader.\n"
                    )
                    from_email = getattr(settings, "DEFAULT_FROM_EMAIL", None) or f"no-reply@{getattr(settings, 'EMAIL_DOMAIN', 'example.com')}"
                    send_mail(subj, body, from_email, [assigned_member.user.email], fail_silently=False)
                    # mark notified flag if we created an assignment
                    if assignment:
                        assignment.notified = True
                        assignment.save(update_fields=['notified'])
                    summary['emailed'] += 1
                except Exception as exc:
                    summary['errors'].append(f"Failed to email {assigned_member.user.email}: {exc}")

    return summary
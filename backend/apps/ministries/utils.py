from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db import transaction
from django.utils import timezone

from .models import Assignment, MinistryMember, Shift


def rotate_and_assign(
    ministry_ids=None,
    days=7,
    dry_run=False,
    notify=False,
    limit_per_ministry=0,
):
    """
    Improved rotation algorithm with smart filtering.

    Features:
    - Checks volunteer availability (available_days)
    - Respects consecutive shift limits
    - Fair distribution based on last assignment

    Returns:
        dict: Summary of created assignments, emails sent, and errors
    """
    summary = {
        "created": 0,
        "emailed": 0,
        "skipped_no_members": [],
        "skipped_no_available": [],
        "errors": [],
    }

    try:
        # Step 1: Find unassigned shifts in date range
        today = timezone.now().date()
        end_date = today + timedelta(days=days)

        print("\n=== ROTATION STARTED ===")
        print(f"Date range: {today} to {end_date}")
        print(f"Ministry IDs: {ministry_ids}")
        print(f"Dry run: {dry_run}")
        print(f"Notify: {notify}")

        shifts_qs = Shift.objects.filter(
            date__gte=today, date__lte=end_date, assignment__isnull=True
        ).select_related("ministry")

        if ministry_ids:
            shifts_qs = shifts_qs.filter(ministry_id__in=ministry_ids)

        shifts_count = shifts_qs.count()
        print(f"Found {shifts_count} unassigned shifts")

        if shifts_count == 0:
            print("No unassigned shifts found")
            return summary

        # Step 2: Group shifts by ministry
        shifts_by_ministry = {}
        for shift in shifts_qs:
            shifts_by_ministry.setdefault(shift.ministry_id, []).append(shift)

        print(f"Shifts grouped into {len(shifts_by_ministry)} ministries")

        # Step 3: Process each ministry
        for ministry_id, shifts_list in shifts_by_ministry.items():
            print(f"\n--- Processing Ministry {ministry_id} ---")
            print(f"Shifts to assign: {len(shifts_list)}")

            # Get active volunteers for this ministry
            members = list(
                MinistryMember.objects.filter(
                    ministry_id=ministry_id, is_active=True
                ).select_related("member")
            )

            if not members:
                print(f"No active members for ministry {ministry_id}")
                summary["skipped_no_members"].append(ministry_id)
                continue

            print(f"Found {len(members)} active volunteers")

            # Step 4: Sort volunteers by last assignment (fairness)
            member_last_assigned = {}
            for mem in members:
                last_assignment = (
                    Assignment.objects.filter(member=mem.member, shift__ministry_id=ministry_id)
                    .order_by("-assigned_at")
                    .first()
                )
                member_last_assigned[mem.member.pk] = (
                    last_assignment.assigned_at if last_assignment else None
                )

            # Sort: Never assigned (None) → Oldest → Newest
            members_sorted = sorted(
                members,
                key=lambda m: (
                    member_last_assigned.get(m.member.pk) is not None,
                    member_last_assigned.get(m.member.pk) or timezone.now(),
                    m.pk,
                ),
            )

            print("Members sorted by fairness")

            # Step 5: Assign shifts with smart filtering
            rot_index = 0
            created_for_ministry = 0
            max_attempts_per_shift = len(members_sorted) * 2

            for shift in shifts_list:
                if limit_per_ministry and created_for_ministry >= limit_per_ministry:
                    print(f"Reached limit of {limit_per_ministry} assignments")
                    break

                print(f"\nAssigning shift: {shift.date} {shift.start_time}-{shift.end_time}")

                assigned = False
                attempts = 0

                while not assigned and attempts < max_attempts_per_shift:
                    # Pick next volunteer in rotation
                    candidate = members_sorted[rot_index % len(members_sorted)]
                    rot_index += 1
                    attempts += 1

                    # Get shift day name (e.g., "Monday")
                    try:
                        shift_day = shift.date.strftime("%A")
                    except Exception as e:
                        print(f"Error getting shift day: {e}")
                        shift_day = None

                    print(f"  Trying {candidate.member.full_name}...")

                    # === SMART FILTERING ===

                    # 1. Check day availability
                    if candidate.available_days and shift_day:
                        if shift_day not in candidate.available_days:
                            print(f"    ❌ Not available on {shift_day}")
                            continue

                    # 2. Check consecutive shift limit
                    if candidate.max_consecutive_shifts:
                        recent_days = candidate.max_consecutive_shifts
                        cutoff_date = shift.date - timedelta(days=recent_days)

                        recent_count = Assignment.objects.filter(
                            member=candidate.member,
                            shift__ministry_id=ministry_id,
                            shift__date__gte=cutoff_date,
                            shift__date__lt=shift.date,
                        ).count()

                        if recent_count >= candidate.max_consecutive_shifts:
                            print(
                                f"    ❌ At consecutive limit: {recent_count}/{candidate.max_consecutive_shifts}"
                            )
                            continue

                    # === PASSED ALL CHECKS - ASSIGN! ===
                    print(f"    ✅ ASSIGNED to {candidate.member.full_name}")

                    if not dry_run:
                        try:
                            with transaction.atomic():
                                assignment = Assignment.objects.create(
                                    shift=shift, member=candidate.member
                                )

                                # Send notification if requested
                                if notify and candidate.member.email:
                                    try:
                                        _send_assignment_notification(assignment, shift, candidate)
                                        summary["emailed"] += 1
                                        print("    📧 Email sent")
                                    except Exception as email_err:
                                        print("    ⚠️ Email failed: " + str(email_err))
                                        summary["errors"].append(
                                            f"Email to {candidate.member.email}: {str(email_err)}"
                                        )

                                summary["created"] += 1
                                created_for_ministry += 1
                                assigned = True

                        except Exception as e:
                            print(f"    ❌ Assignment failed: {e}")
                            summary["errors"].append(f"Shift {shift.id}: {str(e)}")
                    else:
                        # Dry run - just count
                        summary["created"] += 1
                        created_for_ministry += 1
                        assigned = True

                # If no one could be assigned
                if not assigned:
                    print("  ⚠️ Could not assign shift (no available volunteers)")
                    summary["skipped_no_available"].append(shift.id)

            print(f"\n--- Ministry {ministry_id} complete: {created_for_ministry} assignments ---")

        print("\n=== ROTATION COMPLETE ===")
        print(f"Summary: {summary}")

    except Exception as e:
        print(f"\n❌ ROTATION ERROR: {e}")
        import traceback

        traceback.print_exc()
        summary["errors"].append(f"System error: {str(e)}")

    return summary


def _send_assignment_notification(assignment, shift, ministry_member):
    """Send email notification to assigned volunteer."""
    try:
        member = assignment.member

        if not member.email:
            print(f"Member {member.full_name} has no email, skipping notification")
            return

        # Format time
        try:
            start_time = shift.start_time.strftime("%I:%M %p")
            end_time = shift.end_time.strftime("%I:%M %p")
        except Exception:
            start_time = str(shift.start_time)
            end_time = str(shift.end_time)

        # Format date
        try:
            shift_date = shift.date.strftime("%A, %B %d, %Y")
        except Exception:
            shift_date = str(shift.date)

        subject = f"Shift Assignment: {shift.ministry.name}"

        notes_section = "Notes: " + shift.notes if shift.notes else ""
        message = f"""
Hello {member.first_name},

You have been assigned to a shift:

Ministry: {shift.ministry.name}
Date: {shift_date}
Time: {start_time} - {end_time}

{notes_section}

Thank you for serving!

---
SBCC Management System
        """.strip()

        print(f"Sending email to {member.email}")

        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[member.email],
            fail_silently=False,
        )

        print(f"Email sent successfully to {member.email}")

    except Exception as e:
        print(f"Failed to send email: {e}")
        raise

"""
Service functions for member statistics and analytics
Pattern: Similar to apps/attendance/services.py
"""
from datetime import date, timedelta
from django.db.models import Count, Q, Case, When, IntegerField
from django.utils import timezone

from .models import Member


def _next_annual_occurrence(d: date, today: date):
    """Return the next occurrence date (this year or next) for month/day of d."""
    if d is None:
        return None
    try:
        occ = date(today.year, d.month, d.day)
    except ValueError:
        # handle Feb 29 -> fallback to Mar 1
        occ = date(today.year, 3, 1)
    if occ < today:
        try:
            occ = date(today.year + 1, d.month, d.day)
        except ValueError:
            occ = date(today.year + 1, 3, 1)
    return occ


def get_upcoming_birthdays(days=7):
    """
    Return list of dicts: {'member': Member, 'occurrence': date}
    for birthdays occurring in the next `days` days (including today).
    """
    today = timezone.localdate()
    deadline = today + timedelta(days=days)
    results = []
    # simple approach: iterate members (ok for small/medium datasets)
    for m in Member.objects.all():
        occ = _next_annual_occurrence(m.date_of_birth, today)
        if occ and today <= occ <= deadline:
            results.append({"member": m, "occurrence": occ})
    # optional: sort by occurrence date
    results.sort(key=lambda r: r["occurrence"])
    return results


def get_upcoming_anniversaries(days=7):
    """
    Return list of dicts: {'member': Member, 'occurrence': date}
    for anniversaries occurring in the next `days` days (including today).
    """
    today = timezone.localdate()
    deadline = today + timedelta(days=days)
    results = []
    # simple approach: iterate members (ok for small/medium datasets)
    for m in Member.objects.all():
        occ = _next_annual_occurrence(m.baptism_date, today)
        if occ and today <= occ <= deadline:
            results.append({"member": m, "occurrence": occ})
    # optional: sort by occurrence date
    results.sort(key=lambda r: r["occurrence"])
    return results


def get_demographic_statistics():
    """
    Get comprehensive demographic statistics for all members

    Returns:
        Dict with gender, age group, and ministry distribution

    Example:
        {
            "total_members": 150,
            "active_members": 142,
            "gender_distribution": {
                "male": 75,
                "female": 68,
                "other": 7
            },
            "age_groups": {
                "0-17": 15,
                "18-25": 32,
                "26-35": 45,
                "36-50": 38,
                "51-65": 18,
                "66+": 2
            },
            "ministry_distribution": [
                {"ministry_id": 5, "ministry_name": "Music Ministry", "count": 25},
                {"ministry_id": 7, "ministry_name": "Worship Ministry", "count": 18}
            ],
            "unassigned_members": 20
        }
    """
    # Get all active members
    active_members = Member.objects.filter(is_active=True)
    total_members = Member.objects.count()
    active_count = active_members.count()

    # ========== Gender Distribution ==========
    gender_stats = active_members.values('gender').annotate(
        count=Count('id')
    ).order_by('gender')

    gender_distribution = {
        'male': 0,
        'female': 0,
        'other': 0
    }

    for stat in gender_stats:
        gender = stat['gender'] or 'other'
        gender_distribution[gender] = stat['count']

    # ========== Age Group Distribution ==========
    today = date.today()

    # Calculate age groups using conditional aggregation
    age_groups = active_members.aggregate(
        age_0_17=Count(
            Case(
                When(
                    date_of_birth__gte=today - timedelta(days=17 * 365),
                    then=1
                ),
                output_field=IntegerField(),
            )
        ),
        age_18_25=Count(
            Case(
                When(
                    Q(date_of_birth__gte=today - timedelta(days=25 * 365)) &
                    Q(date_of_birth__lt=today - timedelta(days=18 * 365)),
                    then=1
                ),
                output_field=IntegerField(),
            )
        ),
        age_26_35=Count(
            Case(
                When(
                    Q(date_of_birth__gte=today - timedelta(days=35 * 365)) &
                    Q(date_of_birth__lt=today - timedelta(days=26 * 365)),
                    then=1
                ),
                output_field=IntegerField(),
            )
        ),
        age_36_50=Count(
            Case(
                When(
                    Q(date_of_birth__gte=today - timedelta(days=50 * 365)) &
                    Q(date_of_birth__lt=today - timedelta(days=36 * 365)),
                    then=1
                ),
                output_field=IntegerField(),
            )
        ),
        age_51_65=Count(
            Case(
                When(
                    Q(date_of_birth__gte=today - timedelta(days=65 * 365)) &
                    Q(date_of_birth__lt=today - timedelta(days=51 * 365)),
                    then=1
                ),
                output_field=IntegerField(),
            )
        ),
        age_66_plus=Count(
            Case(
                When(
                    date_of_birth__lt=today - timedelta(days=65 * 365),
                    then=1
                ),
                output_field=IntegerField(),
            )
        ),
    )

    # ========== Ministry Distribution ==========
    ministry_stats = (
        active_members
        .filter(ministry__isnull=False)
        .values('ministry__id', 'ministry__name')
        .annotate(count=Count('id'))
        .order_by('-count')
    )

    ministry_distribution = [
        {
            'ministry_id': stat['ministry__id'],
            'ministry_name': stat['ministry__name'],
            'count': stat['count']
        }
        for stat in ministry_stats
    ]

    unassigned_count = active_members.filter(ministry__isnull=True).count()

    # ========== Return Complete Stats ==========
    return {
        'total_members': total_members,
        'active_members': active_count,
        'inactive_members': total_members - active_count,
        'gender_distribution': gender_distribution,
        'age_groups': {
            '0-17': age_groups['age_0_17'],
            '18-25': age_groups['age_18_25'],
            '26-35': age_groups['age_26_35'],
            '36-50': age_groups['age_36_50'],
            '51-65': age_groups['age_51_65'],
            '66+': age_groups['age_66_plus'],
        },
        'ministry_distribution': ministry_distribution,
        'unassigned_members': unassigned_count,
        'generated_at': timezone.now().isoformat(),
    }


def get_ministry_demographics(ministry_id):
    """
    Get demographic statistics for a specific ministry

    Args:
        ministry_id: Ministry ID

    Returns:
        Dict with ministry-specific demographics
    """
    from apps.ministries.models import Ministry

    try:
        ministry = Ministry.objects.get(id=ministry_id)
    except Ministry.DoesNotExist:
        return {'error': 'Ministry not found'}

    members = Member.objects.filter(ministry=ministry, is_active=True)
    total_count = members.count()

    if total_count == 0:
        return {
            'ministry_id': ministry.id,
            'ministry_name': ministry.name,
            'total_members': 0,
            'message': 'No active members in this ministry'
        }

    # Gender distribution
    gender_stats = members.values('gender').annotate(count=Count('id'))
    gender_distribution = {
        'male': 0,
        'female': 0,
        'other': 0
    }
    for stat in gender_stats:
        gender = stat['gender'] or 'other'
        gender_distribution[gender] = stat['count']

    # Age groups (simplified for ministry view)
    today = date.today()
    age_groups = members.aggregate(
        youth=Count(
            Case(
                When(date_of_birth__gte=today - timedelta(days=25 * 365), then=1),
                output_field=IntegerField(),
            )
        ),
        adults=Count(
            Case(
                When(
                    Q(date_of_birth__gte=today - timedelta(days=65 * 365)) &
                    Q(date_of_birth__lt=today - timedelta(days=26 * 365)),
                    then=1
                ),
                output_field=IntegerField(),
            )
        ),
        seniors=Count(
            Case(
                When(date_of_birth__lt=today - timedelta(days=65 * 365), then=1),
                output_field=IntegerField(),
            )
        ),
    )

    return {
        'ministry_id': ministry.id,
        'ministry_name': ministry.name,
        'total_members': total_count,
        'gender_distribution': gender_distribution,
        'age_groups': {
            'youth': age_groups['youth'],
            'adults': age_groups['adults'],
            'seniors': age_groups['seniors'],
        },
        'generated_at': timezone.now().isoformat(),
    }

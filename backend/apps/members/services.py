from datetime import timedelta, date
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
            results.append({'member': m, 'occurrence': occ})
    # optional: sort by occurrence date
    results.sort(key=lambda r: r['occurrence'])
    return results
from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone

from .models import MeetingMinutes, MeetingMinutesVersion


def update_meeting_with_version(meeting, content, changed_by, change_summary=""):
    """
    Update meeting content and create a version record.
    Preserves the old content in version history.
    """
    # Get next version number
    last_version = meeting.versions.order_by("-version_number").first()
    next_version = (last_version.version_number + 1) if last_version else 1

    # Create version with OLD content before updating
    MeetingMinutesVersion.objects.create(
        meeting_minutes=meeting,
        version_number=next_version,
        content=meeting.content,  # Save OLD content
        changed_by=changed_by,
        change_summary=change_summary,
    )

    # Update meeting with new content
    meeting.content = content
    meeting.save()

    return meeting


def get_version_history(meeting):
    """Get all versions for a meeting minutes record."""
    return list(meeting.versions.all())


def get_version(meeting, version_number):
    """Get a specific version of meeting minutes."""
    return meeting.versions.filter(version_number=version_number).first()


def restore_to_version(meeting, version_number, restored_by):
    """
    Restore meeting to a previous version.
    Creates a new version to track the restoration.
    """
    version = get_version(meeting, version_number)
    if not version:
        return None

    # Create version of current content before restoring
    update_meeting_with_version(
        meeting,
        content=version.content,
        changed_by=restored_by,
        change_summary=f"Restored from version {version_number}",
    )

    return meeting


def search_meeting_minutes(query="", category=None, ministry=None, include_attachments=False):
    """
    Search meeting minutes by title, content, and optionally attachment text.
    Returns active records only.
    """
    queryset = MeetingMinutes.objects.filter(is_active=True)

    if query:
        q_filter = Q(title__icontains=query) | Q(content__icontains=query)

        if include_attachments:
            q_filter |= Q(attachments__extracted_text__icontains=query)

        queryset = queryset.filter(q_filter).distinct()

    if category:
        queryset = queryset.filter(category=category)

    if ministry:
        queryset = queryset.filter(ministry=ministry)

    return list(queryset.select_related("ministry", "created_by"))


def get_meetings_by_category():
    """Get count of meetings by category."""
    stats = (
        MeetingMinutes.objects.filter(is_active=True).values("category").annotate(count=Count("id"))
    )
    return {item["category"]: item["count"] for item in stats}


def get_recent_meetings(days=30):
    """Get meetings from the last N days."""
    cutoff_date = timezone.now().date() - timedelta(days=days)
    return list(
        MeetingMinutes.objects.filter(
            is_active=True,
            meeting_date__gte=cutoff_date,
        )
        .select_related("ministry", "created_by")
        .order_by("-meeting_date")
    )

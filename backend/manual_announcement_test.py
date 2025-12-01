import os

import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "sbcc.settings")
django.setup()

from django.db.models import Q  # noqa: E402
from django.utils import timezone  # noqa: E402

from apps.announcements.models import Announcement  # noqa: E402
from apps.ministries.models import Ministry  # noqa: E402

print("=== ANNOUNCEMENT DIAGNOSTICS ===\n")

# 1. Check database counts
print("1. Database Counts:")
print(f"   Total announcements: {Announcement.objects.count()}")
print(f"   Active announcements: {Announcement.objects.filter(is_active=True).count()}")
print(f"   Ministries: {Ministry.objects.count()}\n")

# 2. Check ministries
print("2. Available Ministries:")
for ministry in Ministry.objects.all():
    ann_count = Announcement.objects.filter(ministry=ministry).count()
    print(f"   ID {ministry.id}: {ministry.name} ({ann_count} announcements)")
print()

# 3. Check all announcements
print("3. All Announcements:")
now = timezone.now()
for ann in Announcement.objects.all():
    published = "✅" if ann.is_published() else "❌"
    print(f"{published} ID {ann.id}: {ann.title}")
    print(f"     Audience: {ann.audience}")
    print(f"     Ministry: {ann.ministry_id or 'N/A'}")
    print(f"     Active: {ann.is_active}")
    print(f"     Publish: {ann.publish_at} (now: {now})")
    print(f"     Expire: {ann.expire_at or 'Never'}")
    print()

# 4. Test the filter logic
print("4. Testing Filter Logic:")
print(f"   Current time: {now}\n")

# Test without ministry filter
base_queryset = Announcement.objects.filter(is_active=True, publish_at__lte=now).filter(
    Q(expire_at__isnull=True) | Q(expire_at__gt=now)
)
print(f"   Published announcements (no filter): {base_queryset.count()}")
for ann in base_queryset:
    print(f"     - {ann.title}")
print()

# Test with ministry filter
ministry_id = 3
ministry_queryset = base_queryset.filter(
    Q(audience="all") | Q(audience="ministry", ministry_id=ministry_id)
)
print(f"   Published for ministry {ministry_id}: {ministry_queryset.count()}")
for ann in ministry_queryset:
    print(f"     - {ann.title} (audience: {ann.audience}, ministry: {ann.ministry_id})")
print()

# 5. Recommendations
print("5. Recommendations:")
if Announcement.objects.count() == 0:
    print("   ⚠️  No announcements found. Create some via admin or API.")
elif base_queryset.count() == 0:
    print("   ⚠️  No published announcements. Check publish_at dates.")
elif ministry_queryset.count() == 0:
    print(f"   ⚠️  No announcements for ministry {ministry_id}.")
    print(
        f"      Create announcements with audience='all' or audience='ministry' + ministry={ministry_id}"
    )
else:
    print("   ✅ Everything looks good!")

print("\n=== END DIAGNOSTICS ===")

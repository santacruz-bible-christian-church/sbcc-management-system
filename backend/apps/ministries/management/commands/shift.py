from django.core.management.base import BaseCommand

try:
    from apps.ministries.utils import rotate_and_assign
except ModuleNotFoundError:
    from ...utils import rotate_and_assign


class Command(BaseCommand):
    help = "Rotate assignments for upcoming shifts (wrapper around rotate_and_assign)."

    def add_arguments(self, parser):
        parser.add_argument('--days', type=int, default=7, help='Look ahead days (default 7)')
        parser.add_argument('--dry-run', action='store_true', help='Simulate; do not create or email')
        parser.add_argument('--notify', action='store_true', help='Send email notifications')
        parser.add_argument('--limit-per-ministry', type=int, default=0, help='Limit assignments per ministry (0 = no limit)')
        parser.add_argument('--ministry-ids', type=int, nargs='*', default=None, help='Optional ministry IDs to restrict to')

    def handle(self, *args, **options):
        days = options['days']
        dry_run = options['dry_run']
        notify = options['notify']
        limit = options['limit_per_ministry']
        ministry_ids = options['ministry_ids'] if options['ministry_ids'] else None

        self.stdout.write(self.style.NOTICE(f"Rotating shifts for next {days} day(s). dry_run={dry_run} notify={notify}"))
        summary = rotate_and_assign(ministry_ids=ministry_ids, days=days, dry_run=dry_run, notify=notify, limit_per_ministry=limit)

        self.stdout.write(self.style.SUCCESS(f"Created assignments: {summary.get('created', 0)}"))
        self.stdout.write(self.style.SUCCESS(f"Emailed: {summary.get('emailed', 0)}"))
        if summary.get('skipped_no_members'):
            self.stdout.write(self.style.WARNING(f"Ministries with no active members: {summary['skipped_no_members']}"))
        if summary.get('errors'):
            self.stdout.write(self.style.ERROR("Errors:"))
            for e in summary['errors']:
                self.stdout.write(self.style.ERROR(f"  - {e}"))
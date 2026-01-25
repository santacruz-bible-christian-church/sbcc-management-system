"""
Management command to generate recurring event occurrences.

Usage:
    python manage.py generate_recurring_events
    python manage.py generate_recurring_events --weeks=8
"""

from django.core.management.base import BaseCommand

from apps.events.models import Event


class Command(BaseCommand):
    help = "Generate future occurrences for all recurring events"

    def add_arguments(self, parser):
        parser.add_argument(
            "--weeks",
            type=int,
            default=4,
            help="Number of weeks ahead to generate occurrences (default: 4)",
        )
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be created without actually creating",
        )

    def handle(self, *args, **options):
        weeks_ahead = options["weeks"]
        dry_run = options["dry_run"]

        # Find all parent recurring events (not occurrences)
        recurring_events = Event.objects.filter(
            recurrence_pattern__in=["daily", "weekly", "biweekly", "monthly"],
            parent_event__isnull=True,
        )

        total_created = 0

        for event in recurring_events:
            if dry_run:
                self.stdout.write(
                    f"Would generate occurrences for: {event.title} ({event.recurrence_pattern})"
                )
            else:
                created = event.generate_occurrences(weeks_ahead=weeks_ahead)
                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Created {len(created)} occurrence(s) for: {event.title}"
                        )
                    )
                    total_created += len(created)

        if dry_run:
            self.stdout.write(self.style.WARNING("Dry run - no events created"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Total occurrences created: {total_created}"))

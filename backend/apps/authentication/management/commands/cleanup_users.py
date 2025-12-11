from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

User = get_user_model()


class Command(BaseCommand):
    help = "Remove non-management users from the User table (keeps admin, pastor, ministry_leader)"

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Show what would be deleted without actually deleting",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]

        # Roles to keep
        management_roles = ["admin", "pastor", "ministry_leader"]

        # Find users to delete
        users_to_delete = User.objects.exclude(role__in=management_roles)

        # Also keep superusers
        users_to_delete = users_to_delete.exclude(is_superuser=True)

        count = users_to_delete.count()

        if dry_run:
            self.stdout.write(f"\n=== DRY RUN ===")
            self.stdout.write(f"Would delete {count} users:\n")
            for user in users_to_delete[:20]:
                self.stdout.write(f"  - {user.username} ({user.role})")
            if count > 20:
                self.stdout.write(f"  ... and {count - 20} more")
        else:
            if count == 0:
                self.stdout.write(self.style.SUCCESS("No users to delete."))
                return

            # Confirm
            self.stdout.write(f"\nAbout to delete {count} users with roles: volunteer, member")
            confirm = input("Type 'yes' to confirm: ")

            if confirm.lower() != "yes":
                self.stdout.write(self.style.WARNING("Aborted."))
                return

            deleted, _ = users_to_delete.delete()
            self.stdout.write(self.style.SUCCESS(f"Deleted {deleted} users."))

        # Show remaining users
        remaining = User.objects.all()
        self.stdout.write(f"\n=== Remaining Users ({remaining.count()}) ===")
        for user in remaining:
            self.stdout.write(
                f"  - {user.username} ({user.role}) {'[superuser]' if user.is_superuser else ''}"
            )

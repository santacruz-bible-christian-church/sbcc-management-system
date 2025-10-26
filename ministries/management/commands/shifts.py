from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta, date
from apps.ministries.models import Ministry, MinistryMember, Shift, Assignment
from django.db import transaction

class Command(BaseCommand):
    help = "Generate upcoming shifts for N weeks and auto-assign volunteers round-robin."

    def add_arguments(self, parser):
        parser.add_argument('--weeks', type=int, default=4, help='Number of weeks to generate')
        parser.add_argument('--start', type=str, default=None, help='Start date YYYY-MM-DD (defaults to today)')

    def handle(self, *args, **options):
        weeks = options['weeks']
        start_date = options['start']
        if start_date:
            start = date.fromisoformat(start_date)
        else:
            start = date.today()

        end_date = start + timedelta(weeks=weeks)
        self.stdout.write(f"Generating shifts from {start} to {end_date}")

        for ministry in Ministry.objects.all():
            # Define the roles you want to schedule per ministry. You could store default roles per ministry in DB.
            roles = ['usher', 'worship', 'volunteer']  # adapt as needed

            for single_date in (start + timedelta(days=n) for n in range((end_date - start).days + 1)):
                for role in roles:
                    # create Shift if not exists
                    shift, created = Shift.objects.get_or_create(
                        ministry=ministry,
                        role=role,
                        date=single_date
                    )

        self.stdout.write("Shifts created. Now assigning...")

        # assignment: for each ministry+role+date in chronological order do round-robin among available members
        for ministry in Ministry.objects.all():
            members = list(MinistryMember.objects.filter(ministry=ministry, is_active=True).order_by('id'))
            # rotation pointer mapping: role -> index
            rotation_pointer = {}

            shifts = Shift.objects.filter(ministry=ministry, date__gte=start, date__lte=end_date).order_by('date')
            for shift in shifts:
                role = shift.role
                eligible = [m for m in members if m.role in (role, 'volunteer') and not m.user.assignments.filter(shift__date=shift.date).exists()]

                if not eligible:
                    continue

                idx = rotation_pointer.get(role, 0) % len(eligible)
                member = eligible[idx]

                # create assignment if none
                if not hasattr(shift, 'assignment'):
                    Assignment.objects.create(shift=shift, user=member.user)
                rotation_pointer[role] = (idx + 1)

        self.stdout.write(self.style.SUCCESS("Rotation complete."))
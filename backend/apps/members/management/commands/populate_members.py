import random
from datetime import datetime, timedelta

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from apps.members.models import Member
from apps.ministries.models import Ministry

User = get_user_model()


class Command(BaseCommand):
    help = "Populate database with mockup member data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=50,
            help="Number of members to create (default: 50)",
        )

    def handle(self, *args, **options):
        count = options["count"]

        # Sample data
        first_names_male = [
            "James",
            "John",
            "Michael",
            "David",
            "Joseph",
            "Daniel",
            "Matthew",
            "Christopher",
            "Andrew",
            "Joshua",
            "Ryan",
            "Nathan",
            "Benjamin",
            "Samuel",
            "Thomas",
            "Mark",
            "Paul",
            "Peter",
            "Stephen",
            "Timothy",
        ]

        first_names_female = [
            "Mary",
            "Sarah",
            "Elizabeth",
            "Grace",
            "Hannah",
            "Rachel",
            "Rebecca",
            "Ruth",
            "Esther",
            "Abigail",
            "Emma",
            "Sophia",
            "Olivia",
            "Isabella",
            "Emily",
            "Jessica",
            "Jennifer",
            "Michelle",
            "Amanda",
            "Ashley",
        ]

        last_names = [
            "Smith",
            "Johnson",
            "Williams",
            "Brown",
            "Jones",
            "Garcia",
            "Miller",
            "Davis",
            "Rodriguez",
            "Martinez",
            "Hernandez",
            "Lopez",
            "Gonzalez",
            "Wilson",
            "Anderson",
            "Thomas",
            "Taylor",
            "Moore",
            "Jackson",
            "Martin",
            "Lee",
            "Walker",
            "Hall",
            "Allen",
            "Young",
            "King",
            "Wright",
            "Scott",
            "Torres",
            "Nguyen",
            "Hill",
            "Flores",
            "Green",
            "Adams",
            "Nelson",
            "Baker",
            "Hall",
            "Rivera",
            "Campbell",
            "Mitchell",
        ]

        # Get existing admin user (or first staff user)
        try:
            admin_user = User.objects.filter(is_staff=True).first()
            if not admin_user:
                self.stdout.write(self.style.ERROR("No admin user found. Please create one first."))
                return
            self.stdout.write(self.style.SUCCESS(f"Using admin user: {admin_user.email}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error getting admin user: {str(e)}"))
            return

        # Get all ministries (or create defaults if none exist)
        ministries = list(Ministry.objects.all())
        if not ministries:
            self.stdout.write(
                self.style.WARNING("No ministries found. Creating default ministries...")
            )
            ministry_names = [
                "Music Ministry",
                "Media Ministry",
                "Worship Ministry",
                "Youth Ministry",
            ]
            for name in ministry_names:
                ministry = Ministry.objects.create(
                    name=name,
                    description=f"Description for {name}",
                    leader=admin_user,
                )
                ministries.append(ministry)
            self.stdout.write(self.style.SUCCESS(f"Created {len(ministries)} default ministries"))

        created_count = 0
        skipped_count = 0

        for i in range(count):
            # Randomly choose gender
            gender = random.choice(["male", "female"])
            first_name = random.choice(first_names_male if gender == "male" else first_names_female)
            last_name = random.choice(last_names)

            # Generate unique email
            email = f"{first_name.lower()}.{last_name.lower()}{i}@example.com"

            # Check if email already exists
            if Member.objects.filter(email=email).exists():
                skipped_count += 1
                continue

            # Generate phone number
            phone = f"+1-555-{random.randint(100, 999)}-{random.randint(1000, 9999)}"

            # Generate random date of birth (ages 18-80)
            days_old = random.randint(18 * 365, 80 * 365)
            date_of_birth = datetime.now().date() - timedelta(days=days_old)

            # Random baptism date (50% chance of being baptized)
            baptism_date = None
            if random.random() > 0.5:
                baptism_days_ago = random.randint(365, days_old)
                baptism_date = datetime.now().date() - timedelta(days=baptism_days_ago)

            # Random ministry assignment (70% chance)
            ministry = random.choice(ministries) if random.random() > 0.3 and ministries else None

            # Random status (80% active, 15% inactive, 5% pending)
            status_choices = ["active"] * 80 + ["inactive"] * 15 + ["pending"] * 5
            status = random.choice(status_choices)

            # Create user for this member
            try:
                username = f"{first_name.lower()}{last_name.lower()}{i}"

                # Check if user already exists
                if User.objects.filter(username=username).exists():
                    skipped_count += 1
                    continue

                member_user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    role="member",
                    password="testpassword123",  # Default password for mockup
                )

                # Create member profile
                Member.objects.create(
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    phone=phone,
                    gender=gender,
                    date_of_birth=date_of_birth,
                    baptism_date=baptism_date,
                    ministry=ministry,
                    status=status,
                    is_active=(status == "active"),
                )
                created_count += 1

                if (created_count) % 10 == 0:
                    self.stdout.write(f"Created {created_count} members...")

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error creating member {email}: {str(e)}"))
                skipped_count += 1
                continue

        self.stdout.write(
            self.style.SUCCESS(
                f"\nSuccessfully created {created_count} members" f"\nSkipped: {skipped_count}"
            )
        )

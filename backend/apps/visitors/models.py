from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Visitor(models.Model):
    """
    Visitor model for tracking attendance of non-members.
    Supports marking as visitor/member and follow-up tracking.
    """

    STATUS_CHOICES = [
        ("visitor", "Visitor"),
        ("member", "Member"),
    ]

    FOLLOW_UP_CHOICES = [
        ("visited_1x", "Visited 1x"),
        ("visited_2x", "Visited 2x"),
        ("regular", "Regular Visitor"),
    ]

    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    is_first_time = models.BooleanField(default=True)

    # PRD: Mark as Visitor or Member
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="visitor",
        help_text="Mark as Visitor or Member",
    )

    # PRD: Follow-up tracking
    follow_up_status = models.CharField(
        max_length=20,
        choices=FOLLOW_UP_CHOICES,
        default="visited_1x",
        help_text="Follow-up tracking status",
    )

    # PRD: Link to Member if converted
    converted_to_member = models.ForeignKey(
        "members.Member",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="converted_from_visitor",
        help_text="Link to Member record if converted",
    )

    notes = models.TextField(blank=True, help_text="Additional notes about the visitor")
    date_added = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-date_added"]

    def __str__(self):
        return self.full_name

    @property
    def visit_count(self):
        """Return the number of times this visitor has attended."""
        return self.attendance_records.count()


class VisitorAttendance(models.Model):
    """Track visitor attendance for each service."""

    visitor = models.ForeignKey(
        Visitor, on_delete=models.CASCADE, related_name="attendance_records"
    )
    service_date = models.DateField()
    checked_in_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ("visitor", "service_date")
        ordering = ["-service_date"]

    def __str__(self):
        return f"{self.visitor.full_name} - {self.service_date}"

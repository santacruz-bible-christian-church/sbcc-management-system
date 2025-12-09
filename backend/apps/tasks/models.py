from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models
from django.utils import timezone

User = get_user_model()


class Task(models.Model):
    """
    Task model for church task management
    Supports timeline-based tracking (start_date to end_date) as per PRD feedback
    """

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("in_progress", "In Progress"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("overdue", "Overdue"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("urgent", "Urgent"),
    ]

    # Basic Information
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    # Timeline (as per PRD: replace due_date with timeline feature)
    start_date = models.DateField(help_text="Task start date")
    end_date = models.DateField(help_text="Task end/due date")

    # Progress tracking
    progress_percentage = models.PositiveSmallIntegerField(
        default=0,
        help_text="Task completion percentage (0-100)",
    )

    # Relationships
    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_tasks",
        help_text="User who created the task",
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
        help_text="User assigned to complete the task",
    )
    ministry = models.ForeignKey(
        "ministries.Ministry",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="tasks",
        help_text="Ministry this task belongs to",
    )

    # Completion tracking
    completed_at = models.DateTimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="completed_tasks",
    )

    # Metadata
    notes = models.TextField(blank=True, help_text="Additional notes or updates")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "tasks"
        ordering = ["-priority", "end_date", "-created_at"]
        indexes = [
            models.Index(fields=["status", "end_date"]),
            models.Index(fields=["assigned_to", "status"]),
            models.Index(fields=["ministry", "status"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"

    def clean(self):
        """Validate timeline dates"""
        if self.start_date and self.end_date:
            if self.start_date > self.end_date:
                raise ValidationError({"end_date": "End date must be after start date"})

        if self.progress_percentage < 0 or self.progress_percentage > 100:
            raise ValidationError({"progress_percentage": "Progress must be between 0 and 100"})

    def save(self, *args, **kwargs):
        """Auto-update status based on timeline and progress"""
        self.full_clean()

        # Auto-update status to overdue if past end_date and not completed
        if self.end_date < timezone.now().date() and self.status not in [
            "completed",
            "cancelled",
        ]:
            self.status = "overdue"

        # Auto-update status based on progress
        if self.progress_percentage == 100 and self.status != "completed":
            self.status = "completed"
            if not self.completed_at:
                self.completed_at = timezone.now()

        super().save(*args, **kwargs)

    @property
    def is_overdue(self):
        """Check if task is overdue"""
        return self.end_date < timezone.now().date() and self.status not in [
            "completed",
            "cancelled",
        ]

    @property
    def days_remaining(self):
        """Calculate days remaining until end_date"""
        if self.status in ["completed", "cancelled"]:
            return 0
        delta = self.end_date - timezone.now().date()
        return delta.days

    @property
    def duration_days(self):
        """Calculate total task duration in days"""
        return (self.end_date - self.start_date).days

    @property
    def timeline_progress_percentage(self):
        """
        Calculate progress based on timeline elapsed
        (for visual timeline bar on dashboard)
        """
        today = timezone.now().date()
        if today < self.start_date:
            return 0
        if today > self.end_date:
            return 100

        total_days = (self.end_date - self.start_date).days
        elapsed_days = (today - self.start_date).days

        if total_days == 0:
            return 100

        return min(100, int((elapsed_days / total_days) * 100))


class TaskComment(models.Model):
    """Comments/updates on tasks for collaboration"""

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="task_comments")
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "task_comments"
        ordering = ["-created_at"]

    def __str__(self):
        return f"Comment by {self.user.username} on {self.task.title}"


class TaskAttachment(models.Model):
    """File attachments for tasks"""

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="attachments")
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="task_uploads")
    file = models.FileField(upload_to="task_attachments/%Y/%m/%d/")
    file_name = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "task_attachments"
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.file_name} - {self.task.title}"

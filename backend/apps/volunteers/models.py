from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Visitor(models.Model):
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    is_first_time = models.BooleanField(default=True)
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name


class VisitorAttendance(models.Model):
    visitor = models.ForeignKey(Visitor, on_delete=models.CASCADE, related_name="attendance_records")
    service_date = models.DateField()
    checked_in_at = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        unique_together = ("visitor", "service_date")

    def __str__(self):
        return f"{self.visitor.full_name} - {self.service_date}"
from rest_framework import serializers

from .models import Attendance, AttendanceSheet


class AttendanceSerializer(serializers.ModelSerializer):
    member_name = serializers.CharField(source="member.full_name", read_only=True)
    member_gender = serializers.CharField(source="member.gender", read_only=True)
    member_ministry = serializers.CharField(source="member.ministry.name", read_only=True)
    event_title = serializers.CharField(source="sheet.event.title", read_only=True)
    sheet_date = serializers.DateField(source="sheet.date", read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "sheet",
            "sheet_date",
            "event_title",
            "member",
            "member_name",
            "member_gender",
            "member_ministry",
            "attended",
            "check_in_time",
            "notes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AttendanceSheetSerializer(serializers.ModelSerializer):
    event_title = serializers.CharField(source="event.title", read_only=True)
    total_attended = serializers.IntegerField(read_only=True)
    total_expected = serializers.IntegerField(read_only=True)
    attendance_rate = serializers.FloatField(read_only=True)

    class Meta:
        model = AttendanceSheet
        fields = [
            "id",
            "event",
            "event_title",
            "date",
            "notes",
            "total_attended",
            "total_expected",
            "attendance_rate",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class AttendanceSheetDetailSerializer(serializers.ModelSerializer):
    attendance_records = AttendanceSerializer(many=True, read_only=True)
    event_title = serializers.CharField(source="event.title", read_only=True)
    total_attended = serializers.IntegerField(read_only=True)
    total_expected = serializers.IntegerField(read_only=True)
    attendance_rate = serializers.FloatField(read_only=True)

    class Meta:
        model = AttendanceSheet
        fields = [
            "id",
            "event",
            "event_title",
            "date",
            "notes",
            "total_attended",
            "total_expected",
            "attendance_rate",
            "attendance_records",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

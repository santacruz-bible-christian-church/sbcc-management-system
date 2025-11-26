from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Visitor, VisitorAttendance
from .serializers import VisitorSerializer, VisitorAttendanceSerializer
from .services import AttendanceService

class VisitorListCreateView(generics.ListCreateAPIView):
    queryset = Visitor.objects.all()
    serializer_class = VisitorSerializer
    permission_classes = [IsAuthenticated]


class VisitorAttendanceCheckInView(generics.GenericAPIView):
    serializer_class = VisitorAttendanceSerializer
    permission_classes = [IsAuthenticated]

    def post(self, request):
        visitor_id = request.data.get("visitor_id")
        service_date = request.data.get("service_date")

        if not visitor_id:
            return Response({"error": "visitor_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            visitor = Visitor.objects.get(id=visitor_id)
        except Visitor.DoesNotExist:
            return Response({"error": "Visitor not found"}, status=status.HTTP_404_NOT_FOUND)

        attendance, error = AttendanceService.check_in_visitor(
            visitor=visitor,
            service_date=service_date,
            user=request.user
        )

        if error:
            return Response({"error": error}, status=status.HTTP_400_BAD_REQUEST)

        return Response(VisitorAttendanceSerializer(attendance).data, status=status.HTTP_201_CREATED)


class VisitorAttendanceListView(generics.ListAPIView):
    queryset = VisitorAttendance.objects.all()
    serializer_class = VisitorAttendanceSerializer
    permission_classes = [IsAuthenticated]

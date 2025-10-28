from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Ministry, MinistryMember, Shift, Assignment
from .serializers import MinistrySerializer, MinistryMemberSerializer, ShiftSerializer, AssignmentSerializer


class MinistryViewSet(viewsets.ModelViewSet):
    """ViewSet for Ministry model"""
    queryset = Ministry.objects.all()
    serializer_class = MinistrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def rotate_shifts(self, request, pk=None):
        ministry = self.get_object()
        data = request.data or {}
        days = int(data.get('days', 7))
        dry_run = bool(data.get('dry_run', False))
        notify = bool(data.get('notify', False))
        limit = int(data.get('limit_per_ministry', 0))

        summary = rotate_and_assign(ministry_ids=[ministry.pk], days=days, dry_run=dry_run, notify=notify, limit_per_ministry=limit)
        status_code = status.HTTP_200_OK
        if summary.get('errors'):
            status_code = status.HTTP_207_MULTI_STATUS

        return Response(summary, status=status_code)

class MinistryMemberViewSet(viewsets.ModelViewSet):
    queryset = MinistryMember.objects.all()
    serializer_class = MinistryMemberSerializer
    permission_classes = [permissions.IsAuthenticated]

class ShiftViewSet(viewsets.ModelViewSet):
    queryset = Shift.objects.all()
    serializer_class = ShiftSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['ministry', 'date', 'role']
    ordering_fields = ['date', 'ministry']

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.select_related('shift', 'user').all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

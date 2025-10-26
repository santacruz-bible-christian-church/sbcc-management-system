# apps/ministries/views.py (extend)
from rest_framework import viewsets, permissions
from .models import Ministry, MinistryMember, Shift, Assignment
from .serializers import MinistrySerializer, MinistryMemberSerializer, ShiftSerializer, AssignmentSerializer
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter

class MinistryViewSet(viewsets.ModelViewSet):
    queryset = Ministry.objects.all()
    serializer_class = MinistrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

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

from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Ministry
from .serializers import MinistrySerializer


class MinistryViewSet(viewsets.ModelViewSet):
    """ViewSet for Ministry model"""
    queryset = Ministry.objects.all()
    serializer_class = MinistrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']

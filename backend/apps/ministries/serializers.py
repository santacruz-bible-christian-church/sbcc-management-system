from rest_framework import serializers
from .models import Ministry


class MinistrySerializer(serializers.ModelSerializer):
    leader_name = serializers.CharField(source='leader.username', read_only=True, allow_null=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Ministry
        fields = ['id', 'name', 'description', 'leader', 'leader_name', 'member_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_member_count(self, obj):
        return obj.members.count()
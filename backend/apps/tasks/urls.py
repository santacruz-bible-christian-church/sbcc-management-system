from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TaskAttachmentViewSet, TaskCommentViewSet, TaskViewSet

router = DefaultRouter()
router.register(r"comments", TaskCommentViewSet, basename="task-comment")
router.register(r"attachments", TaskAttachmentViewSet, basename="task-attachment")
router.register(r"", TaskViewSet, basename="task")

urlpatterns = [
    path("", include(router.urls)),
]

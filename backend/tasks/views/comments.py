from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import ADMIN, OWNER, WRITE_TASK_ROLES, get_role, visible_projects
from tasks.models import Task, TaskComment, TaskHistory
from tasks.serializers import TaskCommentSerializer


class TaskCommentListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_task(self, task_id, user):
        return get_object_or_404(Task.objects.select_related("project").filter(project__in=visible_projects(user)), id=task_id)

    def get(self, request, task_id):
        task = self.get_task(task_id, request.user)
        comments = task.comments.select_related("author", "task__project")
        return Response(TaskCommentSerializer(comments, many=True, context={"request": request}).data)

    def post(self, request, task_id):
        task = self.get_task(task_id, request.user)
        if get_role(request.user, task.project) not in WRITE_TASK_ROLES:
            return Response({"detail": "You are not allowed to comment on this task."}, status=status.HTTP_403_FORBIDDEN)
        content = str(request.data.get("content", "")).strip()
        if not content:
            return Response({"content": "Comment cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        if len(content) > 10000:
            return Response({"content": "Comment must be 10000 characters or fewer."}, status=status.HTTP_400_BAD_REQUEST)
        comment = TaskComment.objects.create(task=task, author=request.user, content=content)
        TaskHistory.objects.create(task=task, actor=request.user, action="comment_added", changes={"comment": {"new": content[:300]}})
        return Response(TaskCommentSerializer(comment, context={"request": request}).data, status=status.HTTP_201_CREATED)


class TaskCommentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_comment(self, task_id, comment_id, user):
        return get_object_or_404(
            TaskComment.objects.select_related("task__project", "author").filter(task__project__in=visible_projects(user)),
            task_id=task_id,
            id=comment_id,
        )

    def can_manage(self, request, comment):
        role = get_role(request.user, comment.task.project)
        return comment.author_id == request.user.id or role in (OWNER, ADMIN)

    def patch(self, request, task_id, comment_id):
        comment = self.get_comment(task_id, comment_id, request.user)
        if not self.can_manage(request, comment):
            return Response({"detail": "You can only edit your own comments."}, status=status.HTTP_403_FORBIDDEN)
        content = str(request.data.get("content", "")).strip()
        if not content:
            return Response({"content": "Comment cannot be empty."}, status=status.HTTP_400_BAD_REQUEST)
        if len(content) > 10000:
            return Response({"content": "Comment must be 10000 characters or fewer."}, status=status.HTTP_400_BAD_REQUEST)
        previous = comment.content
        comment.content = content
        comment.save(update_fields=["content", "updated_at"])
        TaskHistory.objects.create(task=comment.task, actor=request.user, action="comment_edited", changes={"comment": {"old": previous[:300], "new": content[:300]}})
        return Response(TaskCommentSerializer(comment, context={"request": request}).data)

    def delete(self, request, task_id, comment_id):
        comment = self.get_comment(task_id, comment_id, request.user)
        if not self.can_manage(request, comment):
            return Response({"detail": "You can only delete your own comments."}, status=status.HTTP_403_FORBIDDEN)
        task = comment.task
        excerpt = comment.content[:300]
        comment.delete()
        TaskHistory.objects.create(task=task, actor=request.user, action="comment_deleted", changes={"comment": {"old": excerpt}})
        return Response(status=status.HTTP_204_NO_CONTENT)

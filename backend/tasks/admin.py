from django.contrib import admin
from tasks.models import AgileBoard, BoardColumn, Sprint, Task, WorkflowStatus

admin.site.register((Task, Sprint, BoardColumn, WorkflowStatus, AgileBoard))

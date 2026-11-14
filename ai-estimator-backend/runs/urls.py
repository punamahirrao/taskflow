from django.urls import path
from .views import DocumentUploadView, RunDetailView, RunRetryView, RunStartView, StoriesReviewView, TestCasesView
urlpatterns = [path("documents/", DocumentUploadView.as_view()), path("runs/", RunStartView.as_view()), path("runs/<str:run_id>/", RunDetailView.as_view()), path("runs/<str:run_id>/retry/", RunRetryView.as_view()), path("runs/<str:run_id>/stories/", StoriesReviewView.as_view()), path("runs/<str:run_id>/test-cases/", TestCasesView.as_view())]

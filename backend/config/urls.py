from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from estimator_proxy import (
    EstimatorDocuments,
    EstimatorRuns,
    EstimatorRunDetail,
    EstimatorCreateStories,
    EstimatorTestCases,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    # Backwards-compatible routes. Domain-owned APIs are also exposed under /api/v1.
    path("accounts/", include("accounts.urls")),
    path("projects/", include("projects.urls")),
    path("tasks/", include("tasks.urls")),
    path("documents/", include("documents.urls")),
    path("dashboard/", include("dashboard.urls")),
    # API gateway namespace: each prefix maps to its domain service boundary.
    path("api/v1/accounts/", include("accounts.urls")),
    path("api/v1/projects/", include("projects.urls")),
    path("api/v1/board/", include("tasks.urls")),
    path("api/v1/documents/", include("documents.urls")),
    path("api/v1/dashboard/", include("dashboard.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path(
        "api/v1/ai-estimator/",
        include(
            (
                [
                    path(
                        "projects/<int:project_id>/documents/",
                        EstimatorDocuments.as_view(),
                    ),
                    path("projects/<int:project_id>/runs/", EstimatorRuns.as_view()),
                    path("runs/<str:run_id>/", EstimatorRunDetail.as_view()),
                    path(
                        "runs/<str:run_id>/stories/", EstimatorCreateStories.as_view()
                    ),
                    path("runs/<str:run_id>/test-cases/", EstimatorTestCases.as_view()),
                ],
                "ai_estimator",
            )
        ),
    ),
    # Old estimator URLs remain valid during frontend/service migration.
    path(
        "api/ai-estimator/v1/projects/<int:project_id>/documents/",
        EstimatorDocuments.as_view(),
    ),
    path(
        "api/ai-estimator/v1/projects/<int:project_id>/runs/", EstimatorRuns.as_view()
    ),
    path("api/ai-estimator/v1/runs/<str:run_id>/", EstimatorRunDetail.as_view()),
    path(
        "api/ai-estimator/v1/runs/<str:run_id>/stories/",
        EstimatorCreateStories.as_view(),
    ),
    path(
        "api/ai-estimator/v1/runs/<str:run_id>/test-cases/",
        EstimatorTestCases.as_view(),
    ),
]

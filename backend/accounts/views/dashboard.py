from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


class DashboardView(APIView):
    def get(self, request):
        return Response(
            {
                "message": "Dashboard page is coming soon."
            },
            status=status.HTTP_200_OK,
        )

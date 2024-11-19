from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.team_member import TeamMemberViewSet

router = DefaultRouter()
router.register(r'team-members', TeamMemberViewSet, basename='team-member')

urlpatterns = [
    path('api/', include(router.urls)),
]
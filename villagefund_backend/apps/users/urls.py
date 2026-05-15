from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, CustomTokenObtainPairView, GoogleLoginView,
    UserProfileView, UserListView, UserRoleUpdateView, LeaderboardView
)

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/google/', GoogleLoginView.as_view(), name='auth_google'),
    path('auth/me/', UserProfileView.as_view(), name='auth_me'),
    path('users/', UserListView.as_view(), name='user_list'),
    path('users/<uuid:pk>/role/', UserRoleUpdateView.as_view(), name='user_role_update'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
]

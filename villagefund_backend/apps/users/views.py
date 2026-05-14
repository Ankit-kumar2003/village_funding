from django.db import models
from django.db.models import Sum
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, ContributionStreak
from .serializers import UserSerializer, RegisterSerializer, CustomTokenObtainPairSerializer, GoogleLoginSerializer
from .permissions import IsSuperAdmin
import uuid

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = RegisterSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class GoogleLoginMockView(views.APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        if serializer.is_valid():
            credential = serializer.validated_data['credential']
            # MOCK LOGIC: We accept any credential and use a mock email
            email = f"mock_{uuid.uuid4().hex[:6]}@gmail.com"
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': email,
                    'full_name': 'Google Mock User',
                    'role': 'CONTRIBUTOR',
                    'google_id': credential[:20]
                }
            )
            if created:
                ContributionStreak.objects.create(user=user)
            
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'role': user.role,
                'full_name': user.full_name,
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsSuperAdmin,)

class UserRoleUpdateView(views.APIView):
    permission_classes = (IsSuperAdmin,)

    def patch(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            new_role = request.data.get('role')
            if new_role in dict(User.ROLE_CHOICES).keys():
                user.role = new_role
                user.save()
                return Response({'status': 'Role updated successfully', 'role': new_role})
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class LeaderboardView(views.APIView):
    permission_classes = (AllowAny,)

    def get(self, request):
        from apps.contributions.models import Contribution
        
        # Top Contributors (Amount)
        top_contributors = User.objects.annotate(
            total_amount=Sum('contributions__amount', filter=models.Q(contributions__status='APPROVED'))
        ).exclude(total_amount=None).order_by('-total_amount')[:10]

        # Top Streaks
        top_streaks = User.objects.select_related('streak').order_by('-streak__current_streak')[:10]

        data = {
            'top_contributors': [
                {
                    'id': str(user.id),
                    'full_name': user.full_name,
                    'village_name': user.village_name,
                    'total_amount': float(user.total_amount),
                    'is_nri': user.is_nri
                } for user in top_contributors
            ],
            'top_streaks': [
                {
                    'id': str(user.id),
                    'full_name': user.full_name,
                    'village_name': user.village_name,
                    'current_streak': user.streak.current_streak if hasattr(user, 'streak') else 0,
                    'is_nri': user.is_nri
                } for user in top_streaks
            ]
        }
        return Response(data)

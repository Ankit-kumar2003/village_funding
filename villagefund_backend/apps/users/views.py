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

from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

class GoogleLoginView(views.APIView):
    permission_classes = (AllowAny,)
    
    def post(self, request):
        serializer = GoogleLoginSerializer(data=request.data)
        if serializer.is_valid():
            credential = serializer.validated_data['credential']
            try:
                # Verify the token with Google
                idinfo = id_token.verify_oauth2_token(
                    credential, 
                    google_requests.Request(), 
                    settings.GOOGLE_CLIENT_ID
                )
                
                email = idinfo['email']
                name = idinfo.get('name', 'Google User')
                google_id = idinfo['sub']
                
                user, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'username': email,
                        'full_name': name,
                        'role': 'CONTRIBUTOR',
                        'google_id': google_id
                    }
                )
                
                if created:
                    ContributionStreak.objects.create(user=user)
                else:
                    # Update name/google_id if changed
                    user.full_name = name
                    user.google_id = google_id
                    user.save()
                
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'role': user.role,
                    'full_name': user.full_name,
                })
            except ValueError:
                return Response({'error': 'Invalid Google token'}, status=status.HTTP_400_BAD_REQUEST)
                
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

from django.shortcuts import redirect
import urllib.parse
from django.conf import settings

class AdminSSOView(views.APIView):
    permission_classes = (AllowAny,)
    
    def get(self, request):
        if not request.user.is_authenticated:
            # If not logged into Django Admin, just redirect to normal frontend login
            return redirect("https://village-funding.vercel.app/login")
            
        refresh = RefreshToken.for_user(request.user)
        access = str(refresh.access_token)
        
        # Build URL with tokens
        base_url = "https://village-funding.vercel.app/sso-login"
        
        # If running locally, we can redirect to localhost for testing
        if settings.DEBUG and "localhost" in request.get_host():
            base_url = "http://localhost:5173/sso-login"
            
        params = {
            'access': access,
            'refresh': str(refresh),
            'full_name': request.user.full_name or 'Admin',
            'role': request.user.role
        }
        
        url = f"{base_url}?{urllib.parse.urlencode(params)}"
        return redirect(url)

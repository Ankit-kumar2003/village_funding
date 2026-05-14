from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, ContributionStreak

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'phone_number', 'full_name', 'profile_photo', 'role', 'is_nri', 'village_name', 'email')
        read_only_fields = ('id', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('phone_number', 'full_name', 'password', 'password_confirm')

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['phone_number'],
            phone_number=validated_data['phone_number'],
            full_name=validated_data['full_name'],
            role='CONTRIBUTOR'
        )
        user.set_password(validated_data['password'])
        user.save()
        ContributionStreak.objects.create(user=user)
        return user

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['phone_number'] = serializers.CharField(required=False)
        if self.username_field in self.fields:
            self.fields[self.username_field].required = False

    def validate(self, attrs):
        phone_or_username = attrs.get('phone_number') or attrs.get('username')
        password = attrs.get('password')

        if phone_or_username and password:
            user = User.objects.filter(phone_number=phone_or_username).first()
            if not user:
                user = User.objects.filter(username=phone_or_username).first()

            if user and user.check_password(password):
                self.user = user
                refresh = self.get_token(self.user)

                data = {
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'role': self.user.role,
                    'full_name': self.user.full_name
                }
                return data
            else:
                raise serializers.ValidationError('No active account found with the given credentials')
        else:
            raise serializers.ValidationError('Must include "phone_number" and "password".')

class GoogleLoginSerializer(serializers.Serializer):
    credential = serializers.CharField(required=True)

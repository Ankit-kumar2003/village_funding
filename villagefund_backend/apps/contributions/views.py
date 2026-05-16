from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Contribution, Pledge
from .serializers import ContributionSerializer, PledgeSerializer
from apps.users.permissions import IsTreasurer, IsSuperAdmin
from rest_framework.permissions import IsAuthenticated
from apps.notifications.emails import send_contribution_received_email, send_contribution_status_email
import threading
from .instamojo import create_payment_request, verify_payment_signature
from django.conf import settings
from django.db import transaction

class ContributionViewSet(viewsets.ModelViewSet):
    queryset = Contribution.objects.all().order_by('-submitted_at')
    serializer_class = ContributionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['campaign', 'status']

    def get_queryset(self):
        # Users can only see their own contributions unless they are Treasurer/SuperAdmin
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'TREASURER']:
            return self.queryset
        return self.queryset.filter(contributor=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        contribution = serializer.save(contributor=self.request.user)
        
        # Prepare Instamojo Payment Request
        amount = contribution.amount
        purpose = f"VillageFund - {contribution.campaign.title[:20]}"
        buyer_name = request.user.full_name
        email = request.user.email if request.user.email else "no-email@villagefund.org"
        phone = request.user.phone_number
        redirect_url = request.build_absolute_uri('/')[:-1] + '/payment-status' # Assuming React runs on root or we proxy it
        
        # In development, we might want a hardcoded redirect URL to the frontend
        # For Vercel/Production, it's better to pass it from frontend
        frontend_url = request.data.get('redirect_url', 'http://localhost:5173/payment-status')
        
        payment_response = create_payment_request(
            amount=amount,
            purpose=purpose,
            buyer_name=buyer_name,
            email=email,
            phone=phone,
            redirect_url=frontend_url
        )
        
        if payment_response.get('success'):
            contribution.instamojo_payment_request_id = payment_response['id']
            contribution.save()
            
            # Send confirmation email asynchronously
            threading.Thread(target=send_contribution_received_email, args=(self.request.user, contribution)).start()
            
            headers = self.get_success_headers(serializer.data)
            data = serializer.data
            data['payment_url'] = payment_response['longurl']
            return Response(data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            contribution.delete() # Rollback if payment creation fails
            return Response({'error': payment_response.get('error', 'Payment gateway error')}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[])
    def webhook(self, request):
        data = request.data.dict() if hasattr(request.data, 'dict') else request.data
        mac_provided = data.get('mac')
        
        if not mac_provided or not verify_payment_signature(data, mac_provided):
            return Response({'error': 'Invalid MAC'}, status=status.HTTP_400_BAD_REQUEST)
            
        payment_request_id = data.get('payment_request_id')
        payment_id = data.get('payment_id')
        payment_status = data.get('status')
        
        try:
            contribution = Contribution.objects.get(instamojo_payment_request_id=payment_request_id)
        except Contribution.DoesNotExist:
            return Response({'error': 'Contribution not found'}, status=status.HTTP_404_NOT_FOUND)
            
        if payment_status == 'Credit':
            # Payment successful
            if contribution.status != 'APPROVED':
                with transaction.atomic():
                    contribution.status = 'APPROVED'
                    contribution.instamojo_payment_id = payment_id
                    contribution.save()
                    
                    campaign = contribution.campaign
                    campaign.raised_amount += contribution.amount
                    campaign.save()
                    
                threading.Thread(target=send_contribution_status_email, args=(contribution.contributor, contribution)).start()
        else:
            # Payment failed
            contribution.status = 'REJECTED'
            contribution.instamojo_payment_id = payment_id
            contribution.save()
            threading.Thread(target=send_contribution_status_email, args=(contribution.contributor, contribution)).start()
            
        return Response(status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[IsTreasurer])
    def approve(self, request, pk=None):
        contribution = self.get_object()
        if contribution.status == 'PENDING':
            contribution.status = 'APPROVED'
            contribution.approved_by = request.user
            contribution.save()
            # Update Campaign raised_amount
            campaign = contribution.campaign
            campaign.raised_amount += contribution.amount
            campaign.save()
            
            # Send approval email
            threading.Thread(target=send_contribution_status_email, args=(contribution.contributor, contribution)).start()
            
            return Response({'status': 'Approved', 'amount': contribution.amount})
        return Response({'error': 'Cannot approve. Status is not PENDING'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsTreasurer])
    def reject(self, request, pk=None):
        contribution = self.get_object()
        if contribution.status == 'PENDING':
            contribution.status = 'REJECTED'
            contribution.save()
            
            # Send rejection email
            threading.Thread(target=send_contribution_status_email, args=(contribution.contributor, contribution)).start()
            
            return Response({'status': 'Rejected'})
        return Response({'error': 'Cannot reject. Status is not PENDING'}, status=status.HTTP_400_BAD_REQUEST)

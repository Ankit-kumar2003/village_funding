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
from .cashfree import create_cashfree_order, verify_cashfree_webhook, get_cashfree_order_status
from django.conf import settings
from django.db import transaction
from decouple import config

class ContributionViewSet(viewsets.ModelViewSet):
    queryset = Contribution.objects.all().order_by('-submitted_at')
    serializer_class = ContributionSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['campaign', 'status', 'cashfree_order_id']

    def get_queryset(self):
        # Users can only see their own contributions unless they are Treasurer/SuperAdmin
        user = self.request.user
        if user.role in ['SUPER_ADMIN', 'TREASURER']:
            qs = self.queryset
        else:
            qs = self.queryset.filter(contributor=user)
            
        # On-the-fly status syncing for PENDING Cashfree payments
        pending_cf = qs.filter(status='PENDING', cashfree_order_id__isnull=False)
        for contribution in pending_cf:
            res = get_cashfree_order_status(contribution.cashfree_order_id)
            if res.get('success'):
                order_status = res.get('order_status')
                if order_status == 'PAID':
                    with transaction.atomic():
                        c = Contribution.objects.select_for_update().get(id=contribution.id)
                        if c.status == 'PENDING':
                            c.status = 'APPROVED'
                            c.save()
                            campaign = c.campaign
                            campaign.raised_amount += c.amount
                            campaign.save()
                            # Asynchronously send email confirmation
                            threading.Thread(target=send_contribution_status_email, args=(c.contributor, c)).start()
                elif order_status in ['EXPIRED', 'CANCELLED']:
                    with transaction.atomic():
                        c = Contribution.objects.select_for_update().get(id=contribution.id)
                        if c.status == 'PENDING':
                            c.status = 'REJECTED'
                            c.save()
        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        contribution = serializer.save(contributor=self.request.user)
        
        # If payment method is manual (Direct UPI / offline bank transfer)
        payment_method = request.data.get('payment_method', 'CASHFREE')
        if payment_method in ['MANUAL_UPI', 'MANUAL_BANK']:
            # Send confirmation email asynchronously
            threading.Thread(target=send_contribution_received_email, args=(self.request.user, contribution)).start()
            
            headers = self.get_success_headers(serializer.data)
            response_serializer = self.get_serializer(contribution)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
        # Prepare Cashfree Order
        order_id = f"VF_ORD_{contribution.id.hex[:16]}"
        amount = contribution.amount
        customer_id = str(request.user.id)
        customer_name = request.user.full_name
        email = request.user.email if request.user.email else "no-email@villagefund.org"
        phone = request.user.phone_number or "9999999999"
        
        # Cashfree will redirect back to this return_url
        frontend_url = request.data.get('redirect_url', 'http://localhost:5173/payment-status')
        return_url = f"{frontend_url}?order_id={order_id}"
        
        payment_response = create_cashfree_order(
            order_id=order_id,
            amount=amount,
            customer_id=customer_id,
            customer_name=customer_name,
            customer_email=email,
            customer_phone=phone,
            return_url=return_url
        )
        
        if payment_response.get('success'):
            contribution.cashfree_order_id = order_id
            contribution.save()
            
            # Send confirmation email asynchronously
            threading.Thread(target=send_contribution_received_email, args=(self.request.user, contribution)).start()
            
            headers = self.get_success_headers(serializer.data)
            data = serializer.data
            data['payment_session_id'] = payment_response['payment_session_id']
            # Send env to frontend so it knows whether to use sandbox or production
            data['cashfree_env'] = config('CASHFREE_ENV', default='sandbox').lower()
            return Response(data, status=status.HTTP_201_CREATED, headers=headers)
        else:
            contribution.delete() # Rollback if order creation fails
            return Response({'error': payment_response.get('error', 'Payment gateway error')}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[])
    def webhook(self, request):
        payload = request.body
        signature = request.headers.get('x-webhook-signature')
        timestamp = request.headers.get('x-webhook-timestamp')
        
        if not signature or not timestamp:
            return Response({'error': 'Missing headers'}, status=status.HTTP_400_BAD_REQUEST)
            
        if not verify_cashfree_webhook(payload, timestamp, signature):
            return Response({'error': 'Invalid Signature'}, status=status.HTTP_400_BAD_REQUEST)
            
        import json
        try:
            event_data = json.loads(payload)
        except Exception:
            return Response({'error': 'Invalid JSON'}, status=status.HTTP_400_BAD_REQUEST)
            
        event_type = event_data.get('type')
        data = event_data.get('data', {})
        order_info = data.get('order', {})
        payment_info = data.get('payment', {})
        
        order_id = order_info.get('order_id')
        cf_payment_id = payment_info.get('cf_payment_id')
        payment_status = payment_info.get('payment_status')
        
        try:
            contribution = Contribution.objects.get(cashfree_order_id=order_id)
        except Contribution.DoesNotExist:
            return Response({'error': 'Contribution not found'}, status=status.HTTP_444_NOT_FOUND if False else status.HTTP_404_NOT_FOUND)
            
        if payment_status == 'SUCCESS':
            # Payment successful
            if contribution.status != 'APPROVED':
                with transaction.atomic():
                    contribution.status = 'APPROVED'
                    contribution.cashfree_payment_id = str(cf_payment_id)
                    contribution.save()
                    
                    campaign = contribution.campaign
                    campaign.raised_amount += contribution.amount
                    campaign.save()
                    
                threading.Thread(target=send_contribution_status_email, args=(contribution.contributor, contribution)).start()
        elif payment_status in ['FAILED', 'USER_DROPPED']:
            # Payment failed
            contribution.status = 'REJECTED'
            contribution.cashfree_payment_id = str(cf_payment_id) if cf_payment_id else None
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

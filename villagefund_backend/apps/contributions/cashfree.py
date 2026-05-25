from decouple import config
import requests
import hmac
import hashlib
import base64
import logging

logger = logging.getLogger(__name__)

# Configuration loaded via python-decouple
CASHFREE_ENV = config('CASHFREE_ENV', default='sandbox').lower() # 'sandbox' or 'production'
CASHFREE_CLIENT_ID = config('CASHFREE_CLIENT_ID', default='')
CASHFREE_CLIENT_SECRET = config('CASHFREE_CLIENT_SECRET', default='')

if CASHFREE_ENV == 'production':
    BASE_URL = 'https://api.cashfree.com/pg/'
else:
    BASE_URL = 'https://sandbox.cashfree.com/pg/'

def create_cashfree_order(order_id, amount, customer_id, customer_name, customer_email, customer_phone, return_url):
    """
    Creates an order on Cashfree and returns the payment_session_id.
    """
    url = f"{BASE_URL}orders"
    
    # Standardize phone number for Cashfree (must be 10 digits, fallback if invalid)
    phone = ''.join(filter(str.isdigit, str(customer_phone)))
    if len(phone) != 10:
        phone = "9999999999"  # Fallback valid phone number
        
    payload = {
        'order_id': str(order_id),
        'order_amount': float(amount),
        'order_currency': 'INR',
        'customer_details': {
            'customer_id': str(customer_id),
            'customer_name': customer_name or "Contributor",
            'customer_email': customer_email or "no-email@villagefund.org",
            'customer_phone': phone
        },
        'order_meta': {
            'return_url': return_url
        }
    }
    
    headers = {
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_CLIENT_ID,
        'x-client-secret': CASHFREE_CLIENT_SECRET,
        'Content-Type': 'application/json'
    }
    
    try:
        logger.info(f"Initiating Cashfree order creation for {order_id}")
        response = requests.post(url, json=payload, headers=headers)
        response_data = response.json()
        
        if response.status_code == 200:
            return {
                'success': True,
                'payment_session_id': response_data.get('payment_session_id'),
                'order_status': response_data.get('order_status'),
                'cf_order_id': response_data.get('cf_order_id')
            }
        else:
            logger.error(f"Cashfree order API failed: {response_data}")
            return {
                'success': False,
                'error': response_data.get('message', 'Unknown error from Cashfree')
            }
    except Exception as e:
        logger.exception("Failed to connect to Cashfree API")
        return {
            'success': False,
            'error': str(e)
        }

def verify_cashfree_webhook(raw_payload, timestamp, signature):
    """
    Verifies Cashfree webhook signature using HMAC-SHA256.
    """
    if not CASHFREE_CLIENT_SECRET:
        logger.error("CASHFREE_CLIENT_SECRET is not configured.")
        return False
        
    try:
        # Construct the signature verification data: timestamp + raw_payload
        signature_data = timestamp.encode('utf-8') + raw_payload
        
        computed_hmac = hmac.new(
            CASHFREE_CLIENT_SECRET.encode('utf-8'),
            signature_data,
            hashlib.sha256
        ).digest()
        
        computed_signature = base64.b64encode(computed_hmac).decode('utf-8')
        
        return computed_signature == signature
    except Exception as e:
        logger.exception("Signature verification failed with exception")
        return False

def get_cashfree_order_status(order_id):
    """
    Fetches the status of an order from Cashfree API.
    """
    url = f"{BASE_URL}orders/{order_id}"
    headers = {
        'x-api-version': '2023-08-01',
        'x-client-id': CASHFREE_CLIENT_ID,
        'x-client-secret': CASHFREE_CLIENT_SECRET,
        'Content-Type': 'application/json'
    }
    try:
        logger.info(f"Querying Cashfree API for status of order {order_id}")
        response = requests.get(url, headers=headers)
        response_data = response.json()
        if response.status_code == 200:
            return {
                'success': True,
                'order_status': response_data.get('order_status'), # PAID, ACTIVE, EXPIRED
                'cf_order_id': response_data.get('cf_order_id')
            }
        else:
            logger.error(f"Failed to fetch order status from Cashfree: {response_data}")
            return {'success': False, 'error': response_data.get('message', 'API Error')}
    except Exception as e:
        logger.exception(f"Connection error while fetching order status for {order_id}")
        return {'success': False, 'error': str(e)}

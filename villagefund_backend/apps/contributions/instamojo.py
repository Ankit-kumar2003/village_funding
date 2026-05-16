import os
import requests
import hmac
import hashlib

# Configuration
INSTAMOJO_ENV = os.environ.get('INSTAMOJO_ENV', 'test') # 'test' or 'live'
INSTAMOJO_API_KEY = os.environ.get('INSTAMOJO_API_KEY', '')
INSTAMOJO_AUTH_TOKEN = os.environ.get('INSTAMOJO_AUTH_TOKEN', '')
INSTAMOJO_SALT = os.environ.get('INSTAMOJO_SALT', '')

if INSTAMOJO_ENV == 'live':
    BASE_URL = 'https://www.instamojo.com/api/1.1/'
else:
    BASE_URL = 'https://test.instamojo.com/api/1.1/'

def create_payment_request(amount, purpose, buyer_name, email, phone, redirect_url):
    """
    Creates a payment request on Instamojo and returns the response.
    Returns:
        dict: containing 'id' and 'longurl' if successful, or error info.
    """
    url = f"{BASE_URL}payment-requests/"
    
    payload = {
        'amount': str(amount),
        'purpose': purpose,
        'buyer_name': buyer_name,
        'email': email,
        'phone': phone,
        'redirect_url': redirect_url,
        'send_email': True,
        'send_sms': False,
        'allow_repeated_payments': False,
    }
    
    headers = {
        'X-Api-Key': INSTAMOJO_API_KEY,
        'X-Auth-Token': INSTAMOJO_AUTH_TOKEN
    }
    
    try:
        response = requests.post(url, data=payload, headers=headers)
        response_data = response.json()
        
        if response_data.get('success'):
            return {
                'success': True,
                'id': response_data['payment_request']['id'],
                'longurl': response_data['payment_request']['longurl']
            }
        else:
            return {
                'success': False,
                'error': response_data.get('message', 'Unknown error from Instamojo')
            }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def verify_payment_signature(data, mac_provided):
    """
    Verifies the MAC signature sent by Instamojo webhook.
    `data` is a dictionary of the POST data sent by Instamojo.
    """
    if not INSTAMOJO_SALT:
        # If no salt is configured, we can't verify. For safety, return False in production.
        # But if we want to allow testing without salt, return True. Let's enforce it.
        print("WARNING: INSTAMOJO_SALT not configured. Fails validation.")
        return False

    message = "|".join(v for k, v in sorted(data.items(), key=lambda item: item[0].lower()) if k.lower() != "mac")
    
    mac_calculated = hmac.new(
        INSTAMOJO_SALT.encode('utf-8'),
        message.encode('utf-8'),
        hashlib.sha1
    ).hexdigest()
    
    return mac_calculated == mac_provided

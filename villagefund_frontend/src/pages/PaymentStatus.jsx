import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const payment_id = searchParams.get('payment_id');
  const payment_status = searchParams.get('payment_status');
  const payment_request_id = searchParams.get('payment_request_id');
  
  const isSuccess = payment_status === 'Credit';
  
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center border border-gray-100">
        {isSuccess ? (
          <>
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold font-heading text-text mb-4">Payment Successful!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Thank you for your generous contribution. Your payment has been securely processed and added to the campaign!
            </p>
            <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-500 mb-8 border border-gray-100 break-all">
              <strong>Transaction ID:</strong> {payment_id}
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h2 className="text-3xl font-bold font-heading text-text mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              We couldn't process your payment at this time. Please try again or contact support if the issue persists.
            </p>
          </>
        )}
        
        <div className="space-y-3">
          <Link to="/campaigns" className="block w-full bg-primary text-white py-3 rounded-md font-bold hover:bg-orange-600 transition-colors">
            Return to Campaigns
          </Link>
          <Link to="/dashboard" className="block w-full bg-gray-100 text-gray-700 py-3 rounded-md font-bold hover:bg-gray-200 transition-colors">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

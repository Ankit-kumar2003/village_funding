import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api/axios';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [checking, setChecking] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('PENDING'); // PENDING, APPROVED, REJECTED, VERIFYING_TIMEOUT
  const [amount, setAmount] = useState(null);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    if (!orderId) {
      setChecking(false);
      setPaymentStatus('REJECTED');
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await api.get('contributions/', {
          params: { cashfree_order_id: orderId }
        });
        
        const contributions = response.data;
        if (contributions && contributions.length > 0) {
          const contribution = contributions[0];
          setAmount(contribution.amount);
          
          if (contribution.status === 'APPROVED') {
            setPaymentStatus('APPROVED');
            setChecking(false);
          } else if (contribution.status === 'REJECTED') {
            setPaymentStatus('REJECTED');
            setChecking(false);
          } else {
            // Still pending in backend, let's retry
            if (attempts < 6) {
              setTimeout(() => {
                setAttempts(prev => prev + 1);
              }, 2000);
            } else {
              setPaymentStatus('VERIFYING_TIMEOUT');
              setChecking(false);
            }
          }
        } else {
          // No contribution record found yet
          if (attempts < 6) {
            setTimeout(() => {
              setAttempts(prev => prev + 1);
            }, 2000);
          } else {
            setPaymentStatus('VERIFYING_TIMEOUT');
            setChecking(false);
          }
        }
      } catch (err) {
        console.error('Error fetching payment status:', err);
        if (attempts < 6) {
          setTimeout(() => {
            setAttempts(prev => prev + 1);
          }, 2500);
        } else {
          setPaymentStatus('VERIFYING_TIMEOUT');
          setChecking(false);
        }
      }
    };

    checkStatus();
  }, [orderId, attempts]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700 transition-all duration-300">
        
        {checking ? (
          <div className="py-8">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold font-heading text-text dark:text-white mb-3">Verifying Payment</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
              Please wait while we secure confirmation from the bank...
            </p>
            {attempts > 1 && (
              <span className="inline-block mt-4 text-xs font-semibold px-3 py-1 bg-orange-50 text-orange-600 dark:bg-orange-950 dark:text-orange-300 rounded-full animate-pulse">
                Attempt {attempts} of 6
              </span>
            )}
          </div>
        ) : (
          <>
            {paymentStatus === 'APPROVED' ? (
              <>
                <div className="w-20 h-20 bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold font-heading text-text dark:text-white mb-4">Payment Successful!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Thank you for your generous support! Your contribution of <strong className="text-primary font-bold">₹{amount}</strong> has been received and credited to the campaign.
                </p>
                <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl text-sm text-gray-500 dark:text-gray-400 mb-8 border border-gray-100 dark:border-gray-800 break-all select-all font-mono">
                  <strong>Order ID:</strong> {orderId}
                </div>
              </>
            ) : paymentStatus === 'VERIFYING_TIMEOUT' ? (
              <>
                <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-950 text-yellow-600 dark:text-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <svg className="w-10 h-10 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold font-heading text-text dark:text-white mb-4">Verification Pending</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  Your payment transaction is taking a bit longer to be acknowledged by the bank. Don't worry, your dashboard will reflect the updated status automatically within a few minutes.
                </p>
                <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-xl text-sm text-gray-500 dark:text-gray-400 mb-8 border border-gray-100 dark:border-gray-800 break-all select-all font-mono">
                  <strong>Order ID:</strong> {orderId}
                </div>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold font-heading text-text dark:text-white mb-4">Payment Failed</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  The payment request was unsuccessful or cancelled. No funds have been deducted from your account. Please try again or get in touch if you face further issues.
                </p>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Link to="/campaigns" className="block w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-opacity-90 transform hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md shadow-primary/20">
                All Campaigns
              </Link>
              <Link to="/dashboard" className="block w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transform hover:-translate-y-0.5 active:translate-y-0 transition-all">
                My Dashboard
              </Link>
            </div>
          </>
        )}
        
      </div>
    </div>
  );
}

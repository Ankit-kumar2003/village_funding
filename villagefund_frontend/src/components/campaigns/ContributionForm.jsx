import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { createContribution } from '../../api/contributions';

export default function ContributionForm({ campaignId }) {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    note: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // The current frontend URL to redirect back to
      const redirect_url = window.location.origin + '/payment-status';
      
      const response = await createContribution({
        campaign: campaignId,
        redirect_url,
        ...formData
      });
      
      // If the backend returns a payment_session_id, trigger the Cashfree checkout flow
      if (response.data && response.data.payment_session_id) {
        const cashfree = window.Cashfree({
          mode: response.data.cashfree_env || 'sandbox'
        });
        
        cashfree.checkout({
          paymentSessionId: response.data.payment_session_id,
          redirectTarget: "_self"
        });
      } else {
        setError(t('paymentSessionError'));
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.error || t('paymentInitError'));
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-8">
      <h3 className="text-xl font-bold font-heading mb-4 text-primary">{t('makeContribution')}</h3>
      
      {!user ? (
        <div className="bg-orange-50 p-4 rounded-md text-orange-800 mb-4">
          {t('loginToContributePrefix')} <button onClick={() => navigate('/login')} className="font-bold underline">{t('loginToContribute')}</button> {t('loginToContributeSuffix')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('amountLabel')}</label>
            <input 
              type="number" 
              name="amount" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
              value={formData.amount} 
              onChange={handleChange} 
              min="1"
              required 
            />
          </div>
          

          
          <div>
            <label className="block text-sm font-medium text-text mb-1">{t('noteLabel')}</label>
            <textarea 
              name="note" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
              value={formData.note} 
              onChange={handleChange} 
              rows="2"
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full text-white py-3 rounded-md font-bold transition-colors ${loading ? 'bg-gray-400' : 'bg-secondary hover:bg-green-700'}`}
          >
            {loading ? t('redirectingToCheckout') : t('payNow')}
          </button>
        </form>
      )}
    </div>
  );
}

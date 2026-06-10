import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { createContribution } from '../../api/contributions';
import { CreditCard, QrCode, Copy, Check, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ContributionForm({ campaign, campaignId }) {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: '',
    note: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('CASHFREE'); // CASHFREE or MANUAL_UPI
  const [utrNumber, setUtrNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCopyUPI = () => {
    const upiId = campaign?.campaign_upi_id || 'mahuaafund@okaxis';
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccessMsg('');
    
    if (paymentMethod === 'MANUAL_UPI') {
      const cleanUtr = utrNumber.trim();
      if (!/^\d{12}$/.test(cleanUtr)) {
        setError(t('utrLengthError') || 'UTR must be exactly a 12-digit number.');
        setLoading(false);
        return;
      }
    }
    
    try {
      const redirect_url = window.location.origin + '/payment-status';
      
      const payload = {
        campaign: campaignId,
        amount: formData.amount,
        note: formData.note,
        payment_method: paymentMethod,
      };

      if (paymentMethod === 'MANUAL_UPI') {
        payload.utr_number = utrNumber.trim();
      } else {
        payload.redirect_url = redirect_url;
      }
      
      const response = await createContribution(payload);
      
      if (paymentMethod === 'MANUAL_UPI') {
        setSuccessMsg(t('manualSuccessMsg'));
        setFormData({ amount: '', note: '' });
        setUtrNumber('');
        setLoading(false);
      } else {
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
      }
    } catch (err) {
      setError(err.response?.data?.error || t('paymentInitError'));
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface p-6 rounded-3xl shadow-sm border border-border mt-8 text-text transition-colors duration-300">
      <h3 className="text-xl font-bold font-heading mb-6 text-primary flex items-center gap-2">
        <QrCode className="w-6 h-6 text-primary" />
        {t('makeContribution')}
      </h3>
      
      {!user ? (
        <div className="p-4 bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30 rounded-2xl text-xs font-bold">
          {t('loginToContributePrefix')}{' '}
          <button onClick={() => navigate('/login')} className="font-bold underline text-primary">
            {t('loginToContribute')}
          </button>{' '}
          {t('loginToContributeSuffix')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-2xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 rounded-2xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {successMsg}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">{t('amountLabel')}</label>
              <input 
                type="number" 
                name="amount" 
                className="w-full px-4 py-3 border border-border bg-background rounded-2xl text-text focus:ring-1 focus:ring-primary focus:border-primary outline-none font-bold text-sm"
                value={formData.amount} 
                onChange={handleChange} 
                min="1"
                required 
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">{t('noteLabel')}</label>
              <input 
                type="text"
                name="note" 
                className="w-full px-4 py-3 border border-border bg-background rounded-2xl text-text focus:ring-1 focus:ring-primary focus:border-primary outline-none text-sm"
                value={formData.note} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted uppercase mb-2">
              {t('paymentMethodLabel')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setPaymentMethod('CASHFREE'); setError(''); }}
                className={`flex items-center justify-center gap-2 p-3 border rounded-2xl text-xs font-bold transition-all shadow-sm ${
                  paymentMethod === 'CASHFREE'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background text-text border-border hover:bg-surface'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{t('payOnline')}</span>
              </button>
              
              <button
                type="button"
                onClick={() => { setPaymentMethod('MANUAL_UPI'); setError(''); }}
                className={`flex items-center justify-center gap-2 p-3 border rounded-2xl text-xs font-bold transition-all shadow-sm ${
                  paymentMethod === 'MANUAL_UPI'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background text-text border-border hover:bg-surface'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>{t('payManual')}</span>
              </button>
            </div>
          </div>

          {paymentMethod === 'MANUAL_UPI' && (
            <div className="bg-background/40 p-5 rounded-2xl border border-border space-y-4">
              <p className="text-xs text-text-muted leading-relaxed">
                {t('upiInstructions')}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 bg-background p-4 rounded-xl border border-border">
                {campaign?.campaign_qr_image ? (
                  <div className="w-24 h-24 bg-white p-1 rounded-lg border border-border flex items-center justify-center shrink-0">
                    <img
                      src={campaign.campaign_qr_image}
                      alt="UPI QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 bg-surface p-1 rounded-lg border border-border flex flex-col items-center justify-center shrink-0 text-text-muted text-[10px] text-center font-bold">
                    <QrCode className="w-8 h-8 mb-1 text-text-muted/40" />
                    <span>QR Code</span>
                  </div>
                )}

                <div className="flex-1 w-full text-center sm:text-left space-y-1">
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                    {t('upiIdLabel')}
                  </span>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <code className="bg-surface px-3 py-1.5 rounded-lg border border-border font-mono text-sm text-text font-bold break-all select-all">
                      {campaign?.campaign_upi_id || 'mahuaafund@okaxis'}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyUPI}
                      className="p-1.5 bg-background hover:bg-surface text-text border border-border rounded-lg transition-colors shrink-0 shadow-sm"
                      title="Copy UPI ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {copied && (
                    <span className="text-[10px] text-green-500 font-bold uppercase block mt-1">
                      {t('copySuccess')}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">
                  {t('utrLabel')}
                </label>
                <input
                  type="text"
                  name="utrNumber"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="e.g. 345678901234"
                  className="w-full px-4 py-3 bg-background text-text border border-border rounded-2xl outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono text-sm tracking-widest font-bold"
                  required={paymentMethod === 'MANUAL_UPI'}
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3.5 rounded-2xl font-bold shadow-md transition-colors text-sm text-white ${
              loading 
                ? 'bg-gray-400 dark:bg-gray-750 cursor-not-allowed' 
                : 'bg-secondary hover:bg-green-700'
            }`}
          >
            {loading 
              ? (paymentMethod === 'CASHFREE' ? t('redirectingToCheckout') : t('submittingManualPay'))
              : (paymentMethod === 'CASHFREE' ? t('payNow') : t('submitManualPay'))
            }
          </button>
        </form>
      )}
    </div>
  );
}

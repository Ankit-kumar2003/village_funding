import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { createContribution } from '../../api/contributions';

export default function ContributionForm({ campaignId }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    amount: '',
    utr_number: '',
    payment_method: 'UPI',
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
      await createContribution({
        campaign: campaignId,
        ...formData
      });
      navigate('/thank-you');
    } catch (err) {
      setError('Failed to submit contribution. Please check your details.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mt-8">
      <h3 className="text-xl font-bold font-heading mb-4 text-primary">Make a Contribution</h3>
      
      {!user ? (
        <div className="bg-orange-50 p-4 rounded-md text-orange-800 mb-4">
          Please <button onClick={() => navigate('/login')} className="font-bold underline">log in</button> to contribute.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-text mb-1">Amount (₹)</label>
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
          
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 text-sm mb-4">
            <p className="font-medium text-text mb-2">Scan & Pay to Village Account</p>
            <div className="flex justify-center my-4">
              <div className="w-32 h-32 bg-gray-300 flex items-center justify-center text-gray-500 rounded-md border-2 border-dashed border-gray-400">
                [QR Code]
              </div>
            </div>
            <p className="text-center text-gray-600 font-mono">UPI: sundarpur@sbi</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-1">UTR / Transaction ID</label>
            <input 
              type="text" 
              name="utr_number" 
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary outline-none"
              value={formData.utr_number} 
              onChange={handleChange} 
              placeholder="e.g. 123456789012"
              required 
            />
            <p className="text-xs text-gray-500 mt-1">Found in your payment app after successful transaction.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text mb-1">Note (Optional)</label>
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
            {loading ? 'Submitting...' : 'Submit Contribution'}
          </button>
        </form>
      )}
    </div>
  );
}

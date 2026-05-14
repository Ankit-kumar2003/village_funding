import { useState, useEffect } from 'react';
import { getCampaigns } from '../../api/campaigns';
import { createExpense } from '../../api/expenses';

export default function ExpenseForm({ onExpenseAdded }) {
  const [campaigns, setCampaigns] = useState([]);
  const [formData, setFormData] = useState({
    campaign: '',
    title: '',
    description: '',
    amount: '',
    vendor_name: '',
    category: 'MATERIALS'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getCampaigns().then(res => setCampaigns(res.data.results || res.data));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await createExpense(formData);
      setFormData({
        campaign: '',
        title: '',
        description: '',
        amount: '',
        vendor_name: '',
        category: 'MATERIALS'
      });
      if (onExpenseAdded) onExpenseAdded();
      alert("Expense logged successfully!");
    } catch (err) {
      setError('Failed to log expense. Check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold font-heading mb-4 text-text">Log New Expense</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="bg-red-50 text-red-500 p-3 rounded text-sm">{error}</div>}
        
        <div>
          <label className="block text-sm font-medium text-text mb-1">Campaign</label>
          <select 
            name="campaign" 
            value={formData.campaign} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            required
          >
            <option value="">Select Campaign</option>
            {campaigns.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Expense Title</label>
          <input 
            type="text" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            required 
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">Amount (₹)</label>
            <input 
              type="number" 
              name="amount" 
              value={formData.amount} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              required 
            />
            <p className="text-xs text-gray-500 mt-1">If &gt; ₹2000, requires multi-sig.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-text mb-1">Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            >
              <option value="MATERIALS">Materials</option>
              <option value="LABOR">Labor</option>
              <option value="LOGISTICS">Logistics</option>
              <option value="FEES">Fees</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text mb-1">Vendor Name</label>
          <input 
            type="text" 
            name="vendor_name" 
            value={formData.vendor_name} 
            onChange={handleChange} 
            className="w-full px-4 py-2 border border-gray-300 rounded-md outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full text-white py-2 rounded-md font-bold transition-colors ${loading ? 'bg-gray-400' : 'bg-primary hover:bg-orange-600'}`}
        >
          {loading ? 'Logging...' : 'Log Expense'}
        </button>
      </form>
    </div>
  );
}

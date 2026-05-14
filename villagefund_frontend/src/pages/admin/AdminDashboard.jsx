import { useEffect, useState, useContext } from 'react';
import { getAllContributions, approveContribution, rejectContribution } from '../../api/contributions';
import { getExpenses, approveExpense } from '../../api/expenses';
import IndianCurrency from '../../components/common/IndianCurrency';
import ExpenseForm from '../../components/admin/ExpenseForm';
import { AuthContext } from '../../context/AuthContext';

export default function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('contributions');
  
  const [contributions, setContributions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contributions') {
        const { data } = await getAllContributions({ status: 'PENDING' });
        setContributions(data.results || data);
      } else {
        const { data } = await getExpenses();
        setExpenses(data.results || data);
      }
    } catch (error) {
      console.error(`Failed to fetch ${activeTab}`, error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAction = async (id, action) => {
    setActionLoading(id);
    try {
      if (activeTab === 'contributions') {
        if (action === 'APPROVE') await approveContribution(id);
        else await rejectContribution(id);
      } else {
        if (action === 'APPROVE_EXPENSE') await approveExpense(id);
      }
      fetchData();
    } catch (error) {
      alert("Action failed. Check console.");
      console.error(error);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-secondary">Treasurer Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-200 mb-6">
        <button
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'contributions' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('contributions')}
        >
          Pending Contributions
        </button>
        <button
          className={`pb-4 px-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === 'expenses' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('expenses')}
        >
          Manage Expenses
        </button>
      </div>

      {activeTab === 'contributions' ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold font-heading text-text">Pending Approvals</h2>
            <span className="bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full">
              {contributions.length} Actions Required
            </span>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading pending contributions...</div>
          ) : contributions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-heading text-gray-700 font-bold mb-2">All Caught Up!</h3>
              <p className="text-gray-500">There are no pending contributions to review right now.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="p-4 font-medium">Contributor</th>
                    <th className="p-4 font-medium">Campaign ID</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">UTR Number</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700">
                  {contributions.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-text">{c.contributor_name}</div>
                      </td>
                      <td className="p-4 font-mono text-xs text-primary" title={c.campaign}>{c.campaign.substring(0,8)}...</td>
                      <td className="p-4 font-bold text-text"><IndianCurrency amount={c.amount} /></td>
                      <td className="p-4">
                        <span className="font-mono text-xs bg-gray-100 rounded px-2 py-1 inline-block border border-gray-200">
                          {c.utr_number}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500 whitespace-nowrap">{new Date(c.submitted_at).toLocaleDateString()}</td>
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleAction(c.id, 'APPROVE')}
                          disabled={actionLoading === c.id}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {actionLoading === c.id ? '...' : 'Verify & Approve'}
                        </button>
                        <button 
                          onClick={() => handleAction(c.id, 'REJECT')}
                          disabled={actionLoading === c.id}
                          className="bg-white text-red-600 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <ExpenseForm onExpenseAdded={fetchData} />
          </div>
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 className="text-xl font-bold font-heading text-text">Expense Ledger</h2>
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-gray-500">Loading expenses...</div>
              ) : expenses.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No expenses logged yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                        <th className="p-4 font-medium">Expense</th>
                        <th className="p-4 font-medium">Amount</th>
                        <th className="p-4 font-medium">Status / Approvals</th>
                        <th className="p-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-gray-700">
                      {expenses.map((exp) => {
                        const hasApproved = exp.approvals?.some(a => a.approved_by === user.id);
                        return (
                          <tr key={exp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                            <td className="p-4">
                              <div className="font-bold text-text mb-1">{exp.description}</div>
                              <div className="text-xs text-gray-500">Campaign: {exp.campaign_title || exp.campaign.substring(0,8)}...</div>
                              <div className="text-xs text-gray-500 mt-1">Category: {exp.category}</div>
                            </td>
                            <td className="p-4 font-bold text-text"><IndianCurrency amount={exp.amount} /></td>
                            <td className="p-4">
                              <div className={`text-xs font-bold px-2 py-1 rounded inline-block ${
                                exp.approval_status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                              }`}>
                                {exp.approval_status}
                              </div>
                              {exp.requires_multi_sig && exp.approval_status === 'PENDING' && (
                                <div className="text-xs text-gray-500 mt-2">
                                  {exp.approval_count} / 2 Approvals Required
                                </div>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              {exp.approval_status === 'PENDING' && !hasApproved && user.role === 'SUPER_ADMIN' ? (
                                <button 
                                  onClick={() => handleAction(exp.id, 'APPROVE_EXPENSE')}
                                  disabled={actionLoading === exp.id}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50"
                                >
                                  {actionLoading === exp.id ? '...' : 'Approve (Multi-Sig)'}
                                </button>
                              ) : exp.approval_status === 'PENDING' && hasApproved ? (
                                <span className="text-xs font-bold text-green-600">You Approved</span>
                              ) : exp.approval_status === 'APPROVED' ? (
                                <span className="text-xs text-gray-400">Complete</span>
                              ) : (
                                <span className="text-xs text-gray-400">Waiting on Admin</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

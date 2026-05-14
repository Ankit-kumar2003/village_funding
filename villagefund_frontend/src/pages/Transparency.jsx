import { useEffect, useState } from 'react';
import { getCampaigns } from '../api/campaigns';
import { getExpenses } from '../api/expenses';
import IndianCurrency from '../components/common/IndianCurrency';

export default function Transparency() {
  const [campaigns, setCampaigns] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [campRes, expRes] = await Promise.all([
          getCampaigns(),
          getExpenses()
        ]);
        setCampaigns(campRes.data.results || campRes.data);
        setExpenses(expRes.data.results || expRes.data);
      } catch (error) {
        console.error("Failed to fetch transparency data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalRaised = campaigns.reduce((sum, c) => sum + parseFloat(c.raised_amount), 0);
  const totalSpent = expenses
    .filter(e => e.approval_status === 'APPROVED')
    .reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const remainingReserve = totalRaised - totalSpent;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-primary mb-4">Public Ledger</h1>
        <p className="text-gray-600 text-lg">
          We believe in 100% transparency. Every rupee contributed to the village fund is tracked here, and every major expense requires multi-signature approval from the village committee.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Raised</p>
              <h2 className="text-4xl font-bold text-green-600 font-heading"><IndianCurrency amount={totalRaised} /></h2>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Total Spent</p>
              <h2 className="text-4xl font-bold text-red-600 font-heading"><IndianCurrency amount={totalSpent} /></h2>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Village Reserve</p>
              <h2 className="text-4xl font-bold text-secondary font-heading"><IndianCurrency amount={remainingReserve} /></h2>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-bold font-heading text-text">Approved Expenses Register</h2>
            </div>
            
            {expenses.filter(e => e.approval_status === 'APPROVED').length === 0 ? (
              <div className="p-12 text-center text-gray-500">No expenses have been approved yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Expense Details</th>
                      <th className="p-4 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700">
                    {expenses.filter(e => e.approval_status === 'APPROVED').map((exp) => (
                      <tr key={exp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="p-4 whitespace-nowrap">{new Date(exp.posted_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="font-bold text-text">{exp.description}</div>
                          <div className="text-xs text-gray-500 mt-1">For: {exp.campaign_title || exp.campaign.substring(0,8)}</div>
                          {exp.requires_multi_sig && (
                            <div className="mt-1 flex items-center text-xs text-secondary font-bold">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Multi-Sig Verified
                            </div>
                          )}
                        </td>
                        <td className="p-4">{exp.vendor_name}</td>
                        <td className="p-4">
                          <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">
                            {exp.category}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold text-red-600">
                          -<IndianCurrency amount={exp.amount} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

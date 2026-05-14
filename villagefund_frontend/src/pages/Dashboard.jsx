import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserContributions } from '../api/contributions';
import IndianCurrency from '../components/common/IndianCurrency';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [contributions, setContributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyContributions = async () => {
      try {
        const { data } = await getUserContributions();
        setContributions(data.results || data);
      } catch (error) {
        console.error("Failed to fetch contributions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyContributions();
  }, []);

  const totalContributed = contributions
    .filter(c => c.status === 'APPROVED')
    .reduce((sum, c) => sum + parseFloat(c.amount), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b pb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-primary">My Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.full_name}</p>
        </div>
        
        {['TREASURER', 'SUPER_ADMIN'].includes(user?.role) && (
          <Link 
            to="/admin" 
            className="mt-4 md:mt-0 bg-secondary text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 transition-colors"
          >
            Go to Admin Panel
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-green-100 p-4 rounded-full text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Contributed</p>
            <p className="text-2xl font-bold text-text"><IndianCurrency amount={totalContributed} /></p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-orange-100 p-4 rounded-full text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active Streak</p>
            <p className="text-2xl font-bold text-text">3 Months</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="bg-blue-100 p-4 rounded-full text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Badges Earned</p>
            <p className="text-2xl font-bold text-text">2</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-xl font-bold font-heading text-text">My Contributions History</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : contributions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500 mb-4">You haven't made any contributions yet.</p>
            <Link to="/campaigns" className="text-primary font-medium hover:underline">Explore Campaigns</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Campaign ID</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Transaction ID / UTR</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="text-sm text-gray-700">
                {contributions.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                    <td className="p-4 whitespace-nowrap">{new Date(c.submitted_at).toLocaleDateString()}</td>
                    <td className="p-4 text-primary">
                      <Link to={`/campaigns/${c.campaign}`} className="hover:underline">
                        {c.campaign.substring(0,8)}...
                      </Link>
                    </td>
                    <td className="p-4 font-bold text-text"><IndianCurrency amount={c.amount} /></td>
                    <td className="p-4 font-mono text-xs">{c.utr_number}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        c.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                        c.status === 'PENDING' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

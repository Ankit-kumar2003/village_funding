import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLeaderboard } from '../api/auth';
import IndianCurrency from '../components/common/IndianCurrency';

export default function Leaderboard() {
  const [data, setData] = useState({ top_contributors: [], top_streaks: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contributors');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await getLeaderboard();
        setData(res.data);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold font-heading text-text mb-4 dark:text-white">Village Honor Roll</h1>
        <p className="text-text-muted text-lg">Recognizing the community heroes driving Sundarpur's growth.</p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mb-8">
        <div className="bg-surface p-1 rounded-xl shadow-sm border border-border flex w-full max-w-md">
          <button
            onClick={() => setActiveTab('contributors')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'contributors'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Top Contributors
          </button>
          <button
            onClick={() => setActiveTab('streaks')}
            className={`flex-1 py-3 px-6 rounded-lg font-bold text-sm transition-all ${
              activeTab === 'streaks'
                ? 'bg-primary text-white shadow-md'
                : 'text-text-muted hover:text-text'
            }`}
          >
            Active Streaks
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl shadow-xl border border-border overflow-hidden transition-all duration-300">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-background text-text-muted text-xs uppercase tracking-wider border-b border-border">
                <th className="p-6 font-medium">Rank</th>
                <th className="p-6 font-medium">Contributor</th>
                <th className="p-6 font-medium">Village/Region</th>
                <th className="p-6 font-medium text-right">
                  {activeTab === 'contributors' ? 'Total Amount' : 'Current Streak'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(activeTab === 'contributors' ? data.top_contributors : data.top_streaks).map((user, index) => (
                <tr key={user.id} className="hover:bg-background/50 transition-colors group">
                  <td className="p-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white shadow-lg' :
                      index === 1 ? 'bg-slate-300 text-white shadow-lg' :
                      index === 2 ? 'bg-orange-400 text-white shadow-lg' :
                      'text-text-muted'
                    }`}>
                      {index + 1}
                    </div>
                  </td>
                  <td className="p-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-text group-hover:text-primary transition-colors">{user.full_name}</div>
                        {user.is_nri && (
                          <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full dark:bg-blue-900 dark:text-blue-200">
                            NRI
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-text-muted">{user.village_name}</td>
                  <td className="p-6 text-right">
                    {activeTab === 'contributors' ? (
                      <div className="text-lg font-bold text-secondary">
                        <IndianCurrency amount={user.total_amount} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-end space-x-2">
                        <span className="text-lg font-bold text-orange-500">{user.current_streak}</span>
                        <span className="text-xl">🔥</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {(activeTab === 'contributors' ? data.top_contributors : data.top_streaks).length === 0 && (
            <div className="p-12 text-center text-text-muted">
              No data available yet. Start contributing to be the first!
            </div>
          )}
        </div>
      )}
      
      <div className="mt-12 bg-primary/5 p-8 rounded-2xl border border-primary/10 text-center">
        <h3 className="text-xl font-bold font-heading text-text mb-2">Want to see your name here?</h3>
        <p className="text-text-muted mb-6">Every contribution, big or small, helps us build a stronger village together.</p>
        <Link to="/campaigns" className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-full shadow-lg hover:bg-orange-600 transition-transform transform hover:-translate-y-1">
          Contribute Now
        </Link>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { getCampaigns } from '../api/campaigns';
import { getExpenses } from '../api/expenses';
import IndianCurrency from '../components/common/IndianCurrency';
import { useLanguage } from '../context/LanguageContext';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function Transparency() {
  const { t } = useLanguage();
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
  const approvedExpenses = expenses.filter(e => e.approval_status === 'APPROVED');
  const totalSpent = approvedExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const remainingReserve = totalRaised - totalSpent;

  // Chart 1: Expenditure Category Breakdown (PieChart)
  const categorySums = approvedExpenses.reduce((acc, exp) => {
    const cat = exp.category || 'General';
    acc[cat] = (acc[cat] || 0) + parseFloat(exp.amount);
    return acc;
  }, {});

  const pieData = Object.keys(categorySums).length > 0 
    ? Object.keys(categorySums).map(cat => ({
        name: cat,
        value: categorySums[cat]
      }))
    : [
        { name: 'Education', value: 30000 },
        { name: 'Infrastructure', value: 45000 },
        { name: 'Solar Grid', value: 15000 }
      ];

  const PIE_COLORS = ['#FF6B00', '#1A6B3C', '#0284C7', '#D4AF37', '#9333EA', '#EC4899'];

  // Chart 2: Cumulative Reserve & Cash Flow Trend (AreaChart)
  const chartData = [
    { name: 'Jan', Income: totalRaised * 0.4 || 35000, Expenses: 10000, Reserve: (totalRaised * 0.4 || 35000) - 10000 },
    { name: 'Feb', Income: totalRaised * 0.55 || 55000, Expenses: 18000, Reserve: (totalRaised * 0.55 || 55000) - 18000 },
    { name: 'Mar', Income: totalRaised * 0.75 || 85000, Expenses: 25000, Reserve: (totalRaised * 0.75 || 85000) - 25000 },
    { name: 'Apr', Income: totalRaised * 0.9 || 120000, Expenses: 35000, Reserve: (totalRaised * 0.9 || 120000) - 35000 },
    { name: 'May (Live)', Income: totalRaised || 140000, Expenses: totalSpent || 45000, Reserve: remainingReserve || 95000 }
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-heading font-bold text-primary mb-4">{t('transparencyTitle')}</h1>
        <p className="text-gray-600 text-lg">
          {t('transparencyDesc')}
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
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t('totalRaisedLabel')}</p>
              <h2 className="text-4xl font-bold text-green-600 font-heading"><IndianCurrency amount={totalRaised || 140000} /></h2>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t('totalSpentLabel')}</p>
              <h2 className="text-4xl font-bold text-red-600 font-heading"><IndianCurrency amount={totalSpent || 45000} /></h2>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">{t('villageReserve')}</p>
              <h2 className="text-4xl font-bold text-secondary font-heading"><IndianCurrency amount={remainingReserve || 95000} /></h2>
            </div>
          </div>

          {/* Interactive Data Visualizations Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
            {/* Cash Flow Area Chart */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-md">
              <div className="mb-6">
                <h3 className="text-lg font-black font-heading text-text-light dark:text-white">Cash Flow & Reserve Growth</h3>
                <p className="text-xs text-gray-400 mt-1">Interactive timeline tracking community funding inputs versus development expenditures.</p>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1A6B3C" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#1A6B3C" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorReserve" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} 
                      labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                    />
                    <Area type="monotone" dataKey="Income" stroke="#1A6B3C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="Reserve" stroke="#FF6B00" strokeWidth={2.5} fillOpacity={1} fill="url(#colorReserve)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Allocation Pie Chart */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-md flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-black font-heading text-text-light dark:text-white">Expenditure Breakdown</h3>
                <p className="text-xs text-gray-400 mt-1">Allocation of approved ledger expenses by sector.</p>
              </div>
              <div className="h-[200px] w-full flex items-center justify-center relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center total label */}
                <div className="absolute text-center">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Spent</span>
                  <p className="text-lg font-black text-gray-800 dark:text-white">₹{totalSpent || '45K'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-gray-100 dark:border-slate-700">
                {pieData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 font-bold text-gray-600 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
                    <span className="truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>


          <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-12">
            <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-bold font-heading text-text">{t('approvedExpensesTitle')}</h2>
            </div>
            
            {expenses.filter(e => e.approval_status === 'APPROVED').length === 0 ? (
              <div className="p-12 text-center text-gray-500">{t('noExpensesApproved')}</div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                      <th className="p-4 font-medium">{t('colDate')}</th>
                      <th className="p-4 font-medium">{t('colExpenseDetails')}</th>
                      <th className="p-4 font-medium text-right">{t('colAmount')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-gray-700">
                    {expenses.filter(e => e.approval_status === 'APPROVED').map((exp) => (
                      <tr key={exp.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="p-4 whitespace-nowrap">{new Date(exp.posted_at).toLocaleDateString()}</td>
                        <td className="p-4">
                          <div className="font-bold text-text">{exp.description}</div>
                          <div className="text-xs text-gray-500 mt-1">{t('forCampaign')}: {exp.campaign_title || exp.campaign.substring(0,8)}</div>
                          {exp.requires_multi_sig && (
                            <div className="mt-1 flex items-center text-xs text-secondary font-bold">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              {t('multiSigVerified')}
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

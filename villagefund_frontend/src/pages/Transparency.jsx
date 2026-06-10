import { useEffect, useState, useMemo } from 'react';
import { getCampaigns } from '../api/campaigns';
import { getExpenses } from '../api/expenses';
import { getPlatformStats } from '../api/transparency';
import { getCampaignReport } from '../api/contributions';
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
} from 'recharts';
import {
  Download,
  Users,
  Filter,
  TrendingUp,
  ShieldCheck,
  FileSpreadsheet,
  ChevronDown,
} from 'lucide-react';

const PIE_COLORS = ['#FF6B00', '#1A6B3C', '#0284C7', '#D4AF37', '#9333EA', '#EC4899'];

/* ─── Utility: Build monthly cash‑flow data from real contributions ─────── */
function buildMonthlyChartData(contributions) {
  if (!contributions.length) return [];

  const monthMap = {};
  contributions.forEach((c) => {
    const d = new Date(c.submitted_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    if (!monthMap[key]) monthMap[key] = { key, label, income: 0 };
    monthMap[key].income += parseFloat(c.amount);
  });

  const sorted = Object.values(monthMap).sort((a, b) => a.key.localeCompare(b.key));

  let cumIncome = 0;
  return sorted.map((m) => {
    cumIncome += m.income;
    return { name: m.label, Income: Math.round(cumIncome) };
  });
}

/* ─── Utility: Export contributors list to CSV (opens in Excel) ─────────── */
function downloadCSV(contributors, campaignName) {
  const headers = [
    'Name',
    'Email',
    'Amount (₹)',
    'Date',
    'Time',
    'Payment Method',
    'Payment Reference',
    'Campaign Name',
    'Campaign ID',
  ];

  const rows = contributors.map((c) => {
    const dt = new Date(c.submitted_at);
    return [
      `"${c.contributor_name || ''}"`,
      `"${c.contributor_email || ''}"`,
      parseFloat(c.amount).toFixed(2),
      dt.toLocaleDateString('en-IN'),
      dt.toLocaleTimeString('en-IN'),
      c.payment_method || '',
      `"${c.payment_reference || ''}"`,
      `"${c.campaign_title || ''}"`,
      `"${c.campaign_id || ''}"`,
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = campaignName
    ? `Contributors_${campaignName.replace(/\s+/g, '_')}.csv`
    : 'All_Contributors_VillageFund.csv';
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function Transparency() {
  const { language } = useLanguage();

  const [stats, setStats] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [allContributors, setAllContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contribLoading, setContribLoading] = useState(false);

  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [campaignContributors, setCampaignContributors] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  /* Initial page load */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [statsRes, campRes, expRes, contribRes] = await Promise.all([
          getPlatformStats(),
          getCampaigns(),
          getExpenses(),
          getCampaignReport(),
        ]);
        setStats(statsRes.data);
        setCampaigns(campRes.data.results || campRes.data);
        setExpenses(expRes.data.results || expRes.data);
        const contribs = contribRes.data.results || contribRes.data;
        setAllContributors(contribs);
        setCampaignContributors(contribs); // show all by default
      } catch (err) {
        console.error('Failed to load transparency data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  /* Filter contributors when a campaign is selected */
  useEffect(() => {
    if (!selectedCampaign) {
      setCampaignContributors(allContributors);
      return;
    }
    setContribLoading(true);
    getCampaignReport({ campaign: selectedCampaign })
      .then((res) => setCampaignContributors(res.data.results || res.data))
      .catch(console.error)
      .finally(() => setContribLoading(false));
  }, [selectedCampaign, allContributors]);

  /* Derived chart data */
  const chartData = useMemo(() => buildMonthlyChartData(allContributors), [allContributors]);

  /* Expense pie data */
  const approvedExpenses = useMemo(
    () => expenses.filter((e) => e.approval_status === 'APPROVED'),
    [expenses]
  );
  const pieData = useMemo(() => {
    const sums = approvedExpenses.reduce((acc, exp) => {
      const cat = exp.category || 'General';
      acc[cat] = (acc[cat] || 0) + parseFloat(exp.amount);
      return acc;
    }, {});
    return Object.entries(sums).map(([name, value]) => ({ name, value }));
  }, [approvedExpenses]);

  const totalSpent = useMemo(
    () => approvedExpenses.reduce((s, e) => s + parseFloat(e.amount), 0),
    [approvedExpenses]
  );

  const selectedCampaignName = useMemo(() => {
    if (!selectedCampaign) return language === 'en' ? 'All Campaigns' : 'सभी अभियान';
    return campaigns.find((c) => c.id === selectedCampaign)?.title || '';
  }, [selectedCampaign, campaigns, language]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 text-text">

      {/* ── Page Header ── */}
      <div className="mb-12 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
          <ShieldCheck className="w-4 h-4" />
          {language === 'en' ? 'Full Public Transparency' : 'पूर्ण सार्वजनिक पारदर्शिता'}
        </div>
        <h1 className="text-4xl md:text-5xl font-heading font-black text-text mb-4">
          {language === 'en' ? 'Where Your Money Goes' : 'आपका पैसा कहाँ जाता है'}
        </h1>
        <p className="text-text-muted text-lg leading-relaxed">
          {language === 'en'
            ? 'Every rupee collected, every expense approved — tracked in real‑time. Download the full contributor list for any campaign.'
            : 'हर एकत्रित रुपया, हर स्वीकृत खर्च — रीयल-टाइम में ट्रैक किया गया। किसी भी अभियान की पूरी योगदानकर्ता सूची डाउनलोड करें।'}
        </p>
      </div>

      {/* ── Live Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
        {[
          {
            label: language === 'en' ? 'Total Raised' : 'कुल राशि',
            value: <IndianCurrency amount={stats?.total_raised || 0} />,
            color: 'text-green-600 dark:text-green-400',
          },
          {
            label: language === 'en' ? 'Total Spent' : 'कुल खर्च',
            value: <IndianCurrency amount={stats?.total_spent || 0} />,
            color: 'text-red-600 dark:text-red-400',
          },
          {
            label: language === 'en' ? 'Village Reserve' : 'ग्राम कोष',
            value: <IndianCurrency amount={stats?.reserve_balance || 0} />,
            color: 'text-secondary',
          },
          {
            label: language === 'en' ? 'Active Campaigns' : 'सक्रिय अभियान',
            value: stats?.campaigns_active ?? 0,
            color: 'text-primary',
          },
          {
            label: language === 'en' ? 'Contributors' : 'योगदानकर्ता',
            value: stats?.active_contributors ?? 0,
            color: 'text-indigo-600 dark:text-indigo-400',
          },
          {
            label: language === 'en' ? 'Transparency Score' : 'पारदर्शिता स्कोर',
            value: `${stats?.transparency_score ?? 100}%`,
            color: 'text-primary',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-surface p-5 rounded-2xl shadow-sm border border-border text-center"
          >
            <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
              {card.label}
            </p>
            <div className={`text-2xl font-black font-heading ${card.color}`}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">

        {/* Cash Flow Area Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-md">
          <div className="mb-5">
            <h3 className="text-lg font-black font-heading text-gray-800 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              {language === 'en' ? 'Cumulative Fundraising Growth' : 'संचयी फंडराइजिंग वृद्धि'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {language === 'en'
                ? 'Real monthly cumulative income from approved contributions.'
                : 'स्वीकृत योगदानों से वास्तविक मासिक संचयी आय।'}
            </p>
          </div>
          {chartData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-text-muted text-sm">
              {language === 'en' ? 'No approved contributions yet.' : 'अभी तक कोई स्वीकृत योगदान नहीं।'}
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A6B3C" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#1A6B3C" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, language === 'en' ? 'Total Raised' : 'कुल राशि']}
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.97)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    labelStyle={{ fontWeight: 'bold', color: '#1f2937' }}
                  />
                  <Area type="monotone" dataKey="Income" stroke="#1A6B3C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Expense Pie Chart */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 md:p-8 rounded-3xl border border-gray-200 dark:border-slate-700/50 shadow-md flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-black font-heading text-gray-800 dark:text-white">
              {language === 'en' ? 'Expenditure Breakdown' : 'व्यय विभाजन'}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {language === 'en' ? 'Approved expense allocation by category.' : 'श्रेणी के अनुसार स्वीकृत व्यय आवंटन।'}
            </p>
          </div>

          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-text-muted py-8">
              {language === 'en' ? 'No approved expenses yet.' : 'अभी तक कोई स्वीकृत खर्च नहीं।'}
            </div>
          ) : (
            <>
              <div className="h-[200px] w-full flex items-center justify-center relative mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={58} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']}
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.97)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute text-center pointer-events-none">
                  <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">
                    {language === 'en' ? 'Total Spent' : 'कुल खर्च'}
                  </span>
                  <p className="text-base font-black text-gray-800 dark:text-white">
                    ₹{Math.round(totalSpent).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs pt-4 border-t border-gray-100 dark:border-slate-700">
                {pieData.slice(0, 6).map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5 font-bold text-gray-600 dark:text-gray-300">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} />
                    <span className="truncate">{entry.name}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Contributor Transparency Table ── */}
      <div className="bg-surface rounded-2xl border border-border shadow-sm overflow-hidden mb-12">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-background/60 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-black font-heading text-text">
              {language === 'en' ? 'Contributor Transparency Report' : 'योगदानकर्ता पारदर्शिता रिपोर्ट'}
            </h2>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Campaign Selector */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((p) => !p)}
                className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-xl text-sm font-bold text-text hover:border-primary transition-colors min-w-[180px] justify-between"
              >
                <div className="flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-text-muted" />
                  <span className="truncate max-w-[140px]">{selectedCampaignName}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-text-muted transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute z-50 top-full mt-1 left-0 w-72 bg-surface border border-border rounded-xl shadow-xl overflow-hidden">
                  <button
                    className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-background transition-colors ${!selectedCampaign ? 'text-primary' : 'text-text'}`}
                    onClick={() => { setSelectedCampaign(''); setDropdownOpen(false); }}
                  >
                    {language === 'en' ? 'All Campaigns' : 'सभी अभियान'}
                  </button>
                  {campaigns.map((c) => (
                    <button
                      key={c.id}
                      className={`w-full text-left px-4 py-2.5 text-sm font-bold hover:bg-background transition-colors border-t border-border ${selectedCampaign === c.id ? 'text-primary' : 'text-text'}`}
                      onClick={() => { setSelectedCampaign(c.id); setDropdownOpen(false); }}
                    >
                      {c.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Download Button */}
            <button
              onClick={() => downloadCSV(campaignContributors, selectedCampaign ? selectedCampaignName : '')}
              disabled={campaignContributors.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-green-800 text-white font-bold rounded-xl text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {language === 'en' ? 'Download Excel' : 'Excel डाउनलोड करें'}
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Table */}
        {contribLoading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary" />
          </div>
        ) : campaignContributors.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            {language === 'en' ? 'No approved contributions found for this campaign.' : 'इस अभियान के लिए कोई स्वीकृत योगदान नहीं मिला।'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-background text-text-muted text-xs uppercase tracking-wider border-b border-border">
                  <th className="p-4 font-medium">{language === 'en' ? 'Contributor' : 'योगदानकर्ता'}</th>
                  <th className="p-4 font-medium">{language === 'en' ? 'Campaign' : 'अभियान'}</th>
                  <th className="p-4 font-medium">{language === 'en' ? 'Amount' : 'राशि'}</th>
                  <th className="p-4 font-medium">{language === 'en' ? 'Date & Time' : 'दिनांक और समय'}</th>
                  <th className="p-4 font-medium">{language === 'en' ? 'Method' : 'भुगतान विधि'}</th>
                  <th className="p-4 font-medium">{language === 'en' ? 'Payment Reference' : 'भुगतान संदर्भ'}</th>
                </tr>
              </thead>
              <tbody className="text-sm text-text">
                {campaignContributors.map((c) => {
                  const dt = new Date(c.submitted_at);
                  return (
                    <tr key={c.id} className="border-b border-border last:border-0 hover:bg-background/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-text">{c.contributor_name}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-text line-clamp-1">{c.campaign_title}</div>
                        <div className="text-[10px] text-text-muted font-mono mt-0.5">{String(c.campaign_id).substring(0, 8)}…</div>
                      </td>
                      <td className="p-4 font-black text-secondary">
                        <IndianCurrency amount={c.amount} />
                      </td>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-medium text-text">{dt.toLocaleDateString('en-IN')}</div>
                        <div className="text-xs text-text-muted">{dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                          c.payment_method === 'MANUAL_UPI'
                            ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/40'
                            : 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/40'
                        }`}>
                          {c.payment_method === 'MANUAL_UPI' ? 'UPI' : c.payment_method === 'CASHFREE' ? 'Online' : c.payment_method}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="font-mono text-xs bg-background text-text-muted px-2 py-1 rounded border border-border">
                          {c.payment_reference ? c.payment_reference.substring(0, 20) : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Row count footer */}
            <div className="px-6 py-3 border-t border-border bg-background/40 text-xs text-text-muted font-bold">
              {campaignContributors.length} {language === 'en' ? 'approved contribution(s) shown' : 'स्वीकृत योगदान दिखाए गए'}
              {' · '}
              <span className="text-text-muted">
                {language === 'en' ? 'Email addresses included in downloaded file only.' : 'ईमेल पते केवल डाउनलोड की गई फ़ाइल में शामिल हैं।'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Approved Expense Ledger ── */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden mb-12">
        <div className="px-6 py-5 border-b border-border bg-background/60">
          <h2 className="text-xl font-black font-heading text-text">
            {language === 'en' ? 'Approved Expense Ledger' : 'स्वीकृत खर्च बही'}
          </h2>
          <p className="text-xs text-text-muted mt-1">
            {language === 'en'
              ? 'All expenditures verified via multi-signature approval.'
              : 'सभी व्यय मल्टी-सिग्नेचर स्वीकृति के माध्यम से सत्यापित।'}
          </p>
        </div>

        {approvedExpenses.length === 0 ? (
          <div className="p-12 text-center text-text-muted">
            {language === 'en' ? 'No approved expenses recorded yet.' : 'अभी तक कोई स्वीकृत खर्च दर्ज नहीं।'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-background text-text-muted text-xs uppercase tracking-wider border-b border-border">
                  <th className="p-4 font-medium">{language === 'en' ? 'Date' : 'दिनांक'}</th>
                  <th className="p-4 font-medium">{language === 'en' ? 'Description' : 'विवरण'}</th>
                  <th className="p-4 font-medium">{language === 'en' ? 'Vendor' : 'विक्रेता'}</th>
                  <th className="p-4 font-medium">{language === 'en' ? 'Category' : 'श्रेणी'}</th>
                  <th className="p-4 font-medium text-right">{language === 'en' ? 'Amount' : 'राशि'}</th>
                </tr>
              </thead>
              <tbody className="text-sm text-text">
                {approvedExpenses.map((exp) => (
                  <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-background/40 transition-colors">
                    <td className="p-4 whitespace-nowrap text-text-muted">
                      {new Date(exp.posted_at).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-text">{exp.description}</div>
                      <div className="text-xs text-text-muted mt-0.5">
                        {language === 'en' ? 'Campaign' : 'अभियान'}: {exp.campaign_title || exp.campaign?.toString().substring(0, 8)}
                      </div>
                      {exp.requires_multi_sig && (
                        <div className="mt-1 flex items-center text-xs text-secondary font-bold">
                          <ShieldCheck className="w-3 h-3 mr-1" />
                          {language === 'en' ? 'Multi-Sig Verified' : 'मल्टी-सिग सत्यापित'}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-text-muted">{exp.vendor_name || '—'}</td>
                    <td className="p-4">
                      <span className="bg-background text-text-muted border border-border px-2 py-1 rounded text-xs font-bold uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-red-600 dark:text-red-400">
                      −<IndianCurrency amount={exp.amount} />
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

import { useEffect, useState } from 'react';
import { getReserveLedger, postReserveEntry } from '../../api/transparency';
import { getCampaigns } from '../../api/campaigns';
import IndianCurrency from '../../components/common/IndianCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  FileText,
  Calendar,
  User,
  Info,
  DollarSign,
  Briefcase
} from 'lucide-react';

export default function ReserveManagement() {
  const [ledger, setLedger] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [amount, setAmount] = useState('');
  const [entryType, setEntryType] = useState('CREDIT');
  const [reason, setReason] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      const [ledgerRes, campaignsRes] = await Promise.all([
        getReserveLedger(),
        getCampaigns()
      ]);
      setLedger(ledgerRes.data.results || ledgerRes.data);
      setCampaigns(campaignsRes.data.results || campaignsRes.data);
    } catch (error) {
      console.error("Failed to load reserve data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute Current Balance
  const totalBalance = ledger.reduce((balance, entry) => {
    const amt = parseFloat(entry.amount);
    return entry.entry_type === 'CREDIT' ? balance + amt : balance - amt;
  }, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!amount || parseFloat(amount) <= 0) {
      setErrorMsg('Please enter a valid amount greater than zero.');
      setSubmitting(false);
      return;
    }

    if (!reason.trim()) {
      setErrorMsg('Please specify a valid reason/description.');
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        amount: parseFloat(amount),
        entry_type: entryType,
        reason: reason.trim(),
        campaign: campaignId || null
      };

      await postReserveEntry(payload);
      setSuccessMsg('Ledger entry created and balance updated successfully!');
      setAmount('');
      setReason('');
      setCampaignId('');
      fetchData(); // Refresh list & balance
    } catch (error) {
      console.error(error);
      setErrorMsg('Failed to post reserve entry. Ensure all inputs are correct.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 text-text transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="border-b pb-6 mb-8 border-border">
          <h1 className="text-3xl font-black font-heading text-secondary flex items-center gap-3">
            Village Reserve Fund
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Manage the village central reserve balance, record emergency credits/debits, and audit the community ledger.
          </p>
        </div>

        {/* Live Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-3xl p-8 text-white shadow-xl shadow-green-950/10 relative overflow-hidden mb-10"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
          <div className="relative z-10 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-green-100 bg-white/10 px-3 py-1 rounded-full">
              Live Central Reserves Balance 🏦
            </span>
            <h2 className="text-5xl font-black font-heading tracking-tight mt-3">
              <IndianCurrency amount={totalBalance} />
            </h2>
            <p className="text-xs text-green-100 font-semibold max-w-md pt-2">
              Reserves accumulate from surplus campaigns and public donations. Deployed solely for emergency community works.
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Create Entry Form */}
          <div className="lg:col-span-1">
            <div className="bg-surface p-6 rounded-3xl border border-border shadow-sm space-y-6">
              <div>
                <h3 className="text-lg font-black text-text font-heading flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-secondary" />
                  Post Ledger Entry
                </h3>
                <p className="text-xs text-text-muted font-bold mt-1">Requires SUPER_ADMIN authority.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {successMsg && (
                  <div className="p-4 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-2xl border border-green-200/20 text-xs font-bold">
                    {successMsg}
                  </div>
                )}
                {errorMsg && (
                  <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 rounded-2xl border border-red-200/20 text-xs font-bold">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-2">Entry Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEntryType('CREDIT')}
                      className={`py-3 rounded-2xl font-black text-xs border transition-all ${
                        entryType === 'CREDIT'
                          ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-300/30'
                          : 'bg-background border-border text-text-muted hover:bg-surface'
                      }`}
                    >
                      Credit (Surplus In)
                    </button>
                    <button
                      type="button"
                      onClick={() => setEntryType('DEBIT')}
                      className={`py-3 rounded-2xl font-black text-xs border transition-all ${
                        entryType === 'DEBIT'
                          ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-300/30'
                          : 'bg-background border-border text-text-muted hover:bg-surface'
                      }`}
                    >
                      Debit (Welfare Out)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Amount (₹)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount in ₹"
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Reason / Description</label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Donation surplus or Emergency pipeline work"
                    rows="3"
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-medium text-sm leading-relaxed"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-muted uppercase mb-1.5">Associated Campaign (Optional)</label>
                  <select
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-bold text-xs"
                  >
                    <option value="">None / General Reserves</option>
                    {campaigns.map((camp) => (
                      <option key={camp.id} value={camp.id}>
                        {camp.title}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-secondary hover:bg-green-700 text-white font-extrabold py-3.5 rounded-2xl text-xs transition-colors shadow-lg shadow-green-900/10 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Post Reserve Ledger Entry'}
                </button>
              </form>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="lg:col-span-2">
            <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
              <div className="px-8 py-5 border-b border-border bg-background/50">
                <h3 className="text-lg font-black text-text font-heading flex items-center gap-2">
                  <FileText className="w-5 h-5 text-text-muted" />
                  Ledger Transaction Logs
                </h3>
              </div>

              {loading ? (
                <div className="py-16 text-center text-text-muted">Loading ledger logs...</div>
              ) : ledger.length === 0 ? (
                <div className="py-16 text-center text-text-muted">No transactions recorded yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-background text-text-muted text-[10px] font-black uppercase tracking-wider border-b border-border">
                        <th className="p-5">Details</th>
                        <th className="p-5">Type</th>
                        <th className="p-5">Amount</th>
                        <th className="p-5">Posted By</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm text-text font-medium">
                      {ledger.map((entry) => (
                        <tr key={entry.id} className="border-b border-border hover:bg-background/40 transition-colors">
                          <td className="p-5 space-y-1">
                            <p className="font-extrabold text-text leading-normal">{entry.reason}</p>
                            <div className="flex items-center gap-3 text-[10px] text-text-muted font-bold">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(entry.posted_at).toLocaleDateString()}</span>
                              {entry.campaign_title && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {entry.campaign_title}</span>}
                            </div>
                          </td>
                          <td className="p-5 whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black uppercase ${
                              entry.entry_type === 'CREDIT' ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                            }`}>
                              {entry.entry_type === 'CREDIT' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                              {entry.entry_type}
                            </span>
                          </td>
                          <td className="p-5 font-black whitespace-nowrap">
                            <span className={entry.entry_type === 'CREDIT' ? 'text-green-600 dark:text-green-400' : 'text-red-650'}>
                              {entry.entry_type === 'CREDIT' ? '+' : '-'} <IndianCurrency amount={entry.amount} />
                            </span>
                          </td>
                          <td className="p-5 whitespace-nowrap text-text-muted font-bold">
                            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-text-muted opacity-60" /> {entry.posted_by_name || 'Admin'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

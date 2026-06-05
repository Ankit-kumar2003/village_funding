import { useEffect, useState } from 'react';
import { getAuditLogs } from '../../api/transparency';
import { motion } from 'framer-motion';
import {
  FileText,
  User,
  Activity,
  Calendar,
  Terminal,
  Search,
  Filter
} from 'lucide-react';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');

  const fetchLogs = async () => {
    try {
      const { data } = await getAuditLogs();
      setLogs(data.results || data);
    } catch (error) {
      console.error("Failed to load audit logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter logs by action and query
  const filteredLogs = logs.filter(log => {
    const q = searchQuery.toLowerCase();
    const actionMatch = selectedAction === 'ALL' || log.action === selectedAction;
    const queryMatch = 
      (log.actor_name || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q) ||
      (log.target_model || '').toLowerCase().includes(q);
    return actionMatch && queryMatch;
  });

  // Extract unique action types for filter options
  const actionTypes = ['ALL', ...new Set(logs.map(log => log.action))];

  return (
    <div className="min-h-screen bg-background py-12 text-text transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="border-b pb-6 mb-8 border-border">
          <h1 className="text-3xl font-black font-heading text-secondary flex items-center gap-3">
            System Audit Trails
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Browse the tamper-proof ledger of administrative actions, contribution verifications, and financial updates.
          </p>
        </div>

        <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
          {/* Controls Bar */}
          <div className="p-6 border-b border-border bg-background/50 flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-semibold text-sm"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-text-muted">
                <Filter className="w-5 h-5" />
              </span>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full sm:w-56 px-4 py-3 rounded-2xl border border-border focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-bold text-xs bg-background text-text"
              >
                {actionTypes.map(type => (
                  <option key={type} value={type}>
                    {type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500 font-bold">Scanning secure logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-20 text-center text-gray-400 font-bold">No system audit actions found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background text-text-muted text-[10px] font-black uppercase tracking-wider border-b border-border">
                    <th className="p-5">Timestamp</th>
                    <th className="p-5">Authorized Actor</th>
                    <th className="p-5">Action Performed</th>
                    <th className="p-5">Audit Context / Payload</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-text font-medium">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-background/40 transition-colors">
                      <td className="p-5 whitespace-nowrap text-text-muted font-bold text-xs">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-text-muted opacity-60" />
                          {new Date(log.timestamp).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </td>
                      <td className="p-5 whitespace-nowrap">
                        <span className="flex items-center gap-2 font-extrabold text-text">
                          <User className="w-4 h-4 text-text-muted opacity-65" />
                          {log.actor_name || 'System Operator'}
                        </span>
                      </td>
                      <td className="p-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase border ${
                          log.action.includes('REJECT') || log.action.includes('DEBIT')
                            ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/40'
                            : 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/40'
                        }`}>
                          <Activity className="w-3.5 h-3.5" />
                          {log.action.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="bg-gray-900 text-green-400 p-4 rounded-2xl border border-gray-800 max-w-lg overflow-x-auto shadow-inner text-xs font-mono">
                          <div className="flex items-center gap-1.5 text-gray-500 font-bold border-b border-gray-800 pb-2 mb-2">
                            <Terminal className="w-3.5 h-3.5 text-gray-400" />
                            Target: {log.target_model} [ID: {log.target_id.substring(0, 8)}...]
                          </div>
                          <pre className="leading-relaxed">{JSON.stringify(log.meta || {}, null, 2)}</pre>
                        </div>
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
  );
}

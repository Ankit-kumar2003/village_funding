import { useEffect, useState } from 'react';
import { getUsers, updateUserRole } from '../../api/users';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Shield,
  User,
  CheckCircle,
  Phone,
  Mail,
  Award,
  Globe
} from 'lucide-react';

export default function UserManagement() {
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleUpdating, setRoleUpdating] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const { data } = await getUsers();
      setUsersList(data.results || data);
    } catch (error) {
      console.error("Failed to load users list", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setRoleUpdating(userId);
    setSuccessMsg('');
    try {
      await updateUserRole(userId, newRole);
      setSuccessMsg('User role updated successfully!');
      // Update state locally
      setUsersList(prev =>
        prev.map(u => u.id === userId ? { ...u, role: newRole } : u)
      );
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (error) {
      alert("Failed to update role. Please verify your permissions.");
      console.error(error);
    } finally {
      setRoleUpdating(null);
    }
  };

  const filteredUsers = usersList.filter(user => {
    const q = searchQuery.toLowerCase();
    return (
      (user.full_name || '').toLowerCase().includes(q) ||
      (user.phone_number || '').toLowerCase().includes(q) ||
      (user.email || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background py-12 text-text transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-6 border-border">
          <div>
            <h1 className="text-3xl font-black font-heading text-secondary flex items-center gap-3">
              User Directory Management
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Search all registered village community accounts, monitor registration profiles, and authorize/assign platform administrative roles.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border border-green-200/20 rounded-2xl text-xs font-bold shadow-sm">
            {successMsg}
          </div>
        )}

        <div className="bg-surface rounded-3xl border border-border shadow-sm overflow-hidden">
          {/* Search Header */}
          <div className="p-6 border-b border-border bg-background/50 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone or email..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-border bg-background text-text focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-semibold text-sm"
              />
            </div>
            <div className="text-xs font-bold text-text-muted">
              Showing {filteredUsers.length} of {usersList.length} members
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500 font-bold">Retrieving system accounts...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center text-gray-400 font-bold">No users matched your query.</div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-background text-text-muted text-[10px] font-black uppercase tracking-wider border-b border-border">
                    <th className="p-5">Community Member</th>
                    <th className="p-5">Credentials / Contact</th>
                    <th className="p-5">Login Provider</th>
                    <th className="p-5 text-right">System Authorization Role</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-text font-medium">
                  {filteredUsers.map((member) => (
                    <tr key={member.id} className="border-b border-border hover:bg-background/40 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-extrabold uppercase shadow-inner text-sm">
                            {member.full_name ? member.full_name.charAt(0) : <User className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-extrabold text-text">{member.full_name}</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider mt-0.5">
                              {member.village_name || 'Mahuaa'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 space-y-1">
                        {member.phone_number && (
                          <p className="flex items-center gap-1.5 text-xs text-text-muted font-bold">
                            <Phone className="w-3.5 h-3.5 text-text-muted opacity-60" />
                            {member.phone_number}
                          </p>
                        )}
                        {member.email && (
                          <p className="flex items-center gap-1.5 text-xs text-text-muted">
                            <Mail className="w-3.5 h-3.5 text-text-muted opacity-60" />
                            {member.email}
                          </p>
                        )}
                      </td>
                      <td className="p-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                          member.google_id 
                            ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/40'
                            : 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-100 dark:border-orange-900/40'
                        }`}>
                          <Globe className="w-3.5 h-3.5" />
                          {member.google_id ? 'Google OAuth2' : 'Phone + Password'}
                        </span>
                      </td>
                      <td className="p-5 text-right whitespace-nowrap">
                        <select
                          disabled={roleUpdating === member.id}
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.id, e.target.value)}
                          className={`px-3 py-2 rounded-xl border border-border font-black text-xs focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all ${
                            member.role === 'SUPER_ADMIN' ? 'bg-red-50 dark:bg-red-950/30 text-red-750 dark:text-red-400 border-red-200/20' :
                            member.role === 'TREASURER' ? 'bg-green-50 dark:bg-green-950/30 text-green-750 dark:text-green-400 border-green-200/20' :
                            'bg-background text-text border border-border'
                          }`}
                        >
                          <option value="SUPER_ADMIN">👑 Super Admin</option>
                          <option value="TREASURER">💼 Treasurer</option>
                          <option value="CONTRIBUTOR">❤️ Contributor</option>
                          <option value="VIEWER">👁️ Viewer (Read Only)</option>
                        </select>
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

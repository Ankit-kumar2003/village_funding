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
    <div className="min-h-screen bg-[#FAFAF7] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-6 border-gray-200">
          <div>
            <h1 className="text-3xl font-black font-heading text-secondary flex items-center gap-3">
              User Directory Management
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Search all registered village community accounts, monitor registration profiles, and authorize/assign platform administrative roles.
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-2xl text-xs font-bold shadow-sm">
            {successMsg}
          </div>
        )}

        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Search Header */}
          <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row items-center gap-4 justify-between">
            <div className="relative w-full md:w-96">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-gray-400">
                <Search className="w-5 h-5" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone or email..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary font-semibold text-sm"
              />
            </div>
            <div className="text-xs font-bold text-gray-500">
              Showing {filteredUsers.length} of {usersList.length} members
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500 font-bold">Retrieving system accounts...</div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-20 text-center text-gray-400 font-bold">No users matched your query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-wider border-b border-gray-100">
                    <th className="p-5">Community Member</th>
                    <th className="p-5">Credentials / Contact</th>
                    <th className="p-5">Login Provider</th>
                    <th className="p-5 text-right">System Authorization Role</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-700 font-medium">
                  {filteredUsers.map((member) => (
                    <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-extrabold uppercase shadow-inner text-sm">
                            {member.full_name ? member.full_name.charAt(0) : <User className="w-5 h-5" />}
                          </div>
                          <div>
                            <p className="font-extrabold text-gray-800">{member.full_name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                              {member.village_name || 'Sundarpur'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 space-y-1">
                        {member.phone_number && (
                          <p className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                            <Phone className="w-3.5 h-3.5 text-gray-400" />
                            {member.phone_number}
                          </p>
                        )}
                        {member.email && (
                          <p className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail className="w-3.5 h-3.5 text-gray-400" />
                            {member.email}
                          </p>
                        )}
                      </td>
                      <td className="p-5 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                          member.google_id 
                            ? 'bg-blue-50 text-blue-700 border-blue-100'
                            : 'bg-orange-50 text-orange-700 border-orange-100'
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
                          className={`px-3 py-2 rounded-xl border border-gray-200 font-black text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all ${
                            member.role === 'SUPER_ADMIN' ? 'bg-red-50 text-red-700 border-red-200' :
                            member.role === 'TREASURER' ? 'bg-green-50 text-green-700 border-green-200' :
                            'bg-white text-gray-700'
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

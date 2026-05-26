import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getUserContributions } from '../api/contributions';
import { getUserBadges, getAllBadges } from '../api/badges';
import IndianCurrency from '../components/common/IndianCurrency';
import ThreeDBadgeCard from '../components/profile/3DBadgeCard';
import { motion } from 'framer-motion';
import {
  User,
  Award,
  TrendingUp,
  History,
  Shield,
  Heart,
  Calendar,
  Lock,
  CheckCircle,
  MapPin,
  Mail,
  Phone,
  HelpCircle,
  IndianRupee,
  Activity
} from 'lucide-react';

export default function Profile() {
  const { user } = useContext(AuthContext);
  const { t } = useLanguage();
  const [contributions, setContributions] = useState([]);
  const [userBadges, setUserBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contributions');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [contribRes, userBadgesRes, allBadgesRes] = await Promise.all([
          getUserContributions(),
          getUserBadges(),
          getAllBadges()
        ]);
        setContributions(contribRes.data.results || contribRes.data);
        setUserBadges(userBadgesRes.data.results || userBadgesRes.data);
        setAllBadges(allBadgesRes.data.results || allBadgesRes.data);
      } catch (error) {
        console.error("Failed to fetch profile details", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const approvedContributions = contributions.filter(c => c.status === 'APPROVED');
  const totalContributed = approvedContributions.reduce((sum, c) => sum + parseFloat(c.amount), 0);
  const campaignsCount = new Set(approvedContributions.map(c => c.campaign)).size;

  // Streak details fallback if no backend object exists
  const currentStreak = user?.streak?.current_streak || 3;
  const longestStreak = user?.streak?.longest_streak || 5;

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* User Banner Card */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-8 text-white shadow-xl shadow-orange-900/10 overflow-hidden mb-10"
        >
          {/* Decorative radial blur elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="absolute -bottom-20 left-10 w-64 h-64 bg-black/10 rounded-full blur-2xl"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-full border-4 border-white/50 flex items-center justify-center text-4xl font-black uppercase text-white shadow-inner">
                {user?.full_name ? user.full_name.charAt(0) : <User className="w-12 h-12 text-white" />}
              </div>
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-3xl font-extrabold font-heading tracking-tight">{user?.full_name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    user?.role === 'SUPER_ADMIN' ? 'bg-red-600 text-white border border-red-500' :
                    user?.role === 'TREASURER' ? 'bg-green-700 text-white' : 'bg-white/25 text-white'
                  }`}>
                    {user?.role?.replace('_', ' ')}
                  </span>
                  {user?.is_nri && (
                    <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded border border-blue-400">
                      {t('profileNriTag')}
                    </span>
                  )}
                </div>
                <p className="text-orange-50/90 font-medium text-sm mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {user?.village_name || 'Mahuaa'}</span>
                  {user?.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {user.email}</span>}
                  {user?.phone_number && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {user.phone_number}</span>}
                </p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex gap-6 text-center shadow-lg">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-100">{t('profileContribRank')}</p>
                <p className="text-3xl font-black font-heading mt-1 text-yellow-300">#4</p>
              </div>
              <div className="w-px bg-white/20"></div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-orange-100">{t('profileBadgesWon')}</p>
                <p className="text-3xl font-black font-heading mt-1 text-white">{userBadges.length}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Summary Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: t('profileTotalInvested'), val: <IndianCurrency amount={totalContributed} />, icon: <IndianRupee className="w-6 h-6" />, color: 'text-green-600 bg-green-50 border-green-100' },
            { label: t('profileProjectsBacked'), val: campaignsCount, icon: <Heart className="w-6 h-6" />, color: 'text-rose-600 bg-rose-50 border-rose-100' },
            { label: t('profileActiveStreak'), val: `${currentStreak} ${t('profileCampaignUnit')}`, icon: <TrendingUp className="w-6 h-6" />, color: 'text-orange-600 bg-orange-50 border-orange-100' },
            { label: t('profileLongestStreak'), val: `${longestStreak} ${t('profileCampaignUnit')}`, icon: <Activity className="w-6 h-6" />, color: 'text-amber-600 bg-amber-50 border-amber-100' }
          ].map((stat, i) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              key={stat.label}
              className="bg-white p-6 rounded-2xl border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4"
            >
              <div className={`p-3.5 rounded-xl border ${stat.color} flex items-center justify-center`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                <p className="text-2xl font-black font-heading text-gray-800 mt-1">{stat.val}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Section Navigation Tabs */}
        <div className="flex border-b border-gray-200 mb-8">
          {[
            { id: 'contributions', label: t('profileTabContributions'), icon: <History className="w-4 h-4" /> },
            { id: 'badges', label: t('profileTabBadges'), icon: <Award className="w-4 h-4" /> },
            { id: 'pledges', label: t('profileTabPledges'), icon: <Calendar className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 px-6 font-bold text-sm border-b-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        {loading ? (
          <div className="py-20 text-center text-gray-500 font-medium">{t('profileLoadingItems')}</div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Contributions History Tab */}
            {activeTab === 'contributions' && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-8 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h3 className="text-lg font-black text-gray-800 font-heading">{t('profileContribLog')}</h3>
                  <button className="text-xs font-bold text-orange-600 hover:underline">
                    {t('profileDownloadPdf')}
                  </button>
                </div>

                {contributions.length === 0 ? (
                  <div className="py-16 text-center text-gray-500">
                    <p className="mb-4">{t('profileNoContrib')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-[10px] font-black uppercase tracking-wider border-b border-gray-100">
                          <th className="p-5">{t('profileColDate')}</th>
                          <th className="p-5">{t('profileColCampaignId')}</th>
                          <th className="p-5">{t('profileColAmount')}</th>
                          <th className="p-5">{t('profileColUtr')}</th>
                          <th className="p-5">{t('profileColStatus')}</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm text-gray-700 font-medium">
                        {contributions.map((c) => (
                          <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/40 transition-colors">
                            <td className="p-5 whitespace-nowrap text-gray-500">
                              {new Date(c.submitted_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </td>
                            <td className="p-5 text-orange-600 font-bold font-mono">
                              {c.campaign.substring(0, 8)}...
                            </td>
                            <td className="p-5 font-black text-gray-800">
                              <IndianCurrency amount={c.amount} />
                            </td>
                            <td className="p-5 font-mono text-xs text-gray-500">
                              {c.utr_number || 'N/A'}
                            </td>
                            <td className="p-5">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${
                                c.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-100' :
                                c.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                'bg-red-50 text-red-700 border-red-100'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  c.status === 'APPROVED' ? 'bg-green-500' :
                                  c.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'
                                }`}></span>
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
            )}

            {/* Badges Tab */}
            {activeTab === 'badges' && (
              <div>
                <div className="mb-6">
                  <h3 className="text-xl font-extrabold text-gray-800 font-heading">{t('profileBadgesTitle')}</h3>
                  <p className="text-gray-500 text-sm mt-1">{t('profileBadgesDesc')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Map all badges and highlight the earned ones */}
                  {allBadges.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-gray-500">{t('profileNoBadges')}</div>
                  ) : (
                    allBadges.map((badge) => {
                      const earned = userBadges.some((ub) => ub.badge === badge.id);
                      return (
                        <ThreeDBadgeCard 
                          key={badge.id} 
                          badge={badge} 
                          earned={earned} 
                          t={t} 
                        />
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Pledges Tracker Tab */}
            {activeTab === 'pledges' && (
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden p-8">
                <div className="max-w-2xl mx-auto text-center space-y-6 py-10">
                  <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
                    <Calendar className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-black font-heading text-gray-800">{t('profilePledgesTitle')}</h4>
                  <p className="text-gray-500 leading-relaxed max-w-lg mx-auto">
                    {t('profilePledgesDesc')}
                  </p>

                  <div className="p-6 bg-gray-50 rounded-2xl border border-gray-200 max-w-md mx-auto text-left space-y-4">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-gray-500 text-sm">{t('profileActivePledge')}</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">{t('profileActive')}</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('profileCampaignTarget')}</p>
                      <p className="font-extrabold text-gray-800 text-base mt-0.5">Mahuaa Smart School Infrastructure</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('profileInstallment')}</p>
                        <p className="font-extrabold text-gray-800 text-base mt-0.5">₹2,000 / month</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider">{t('profileNextDueDate')}</p>
                        <p className="font-extrabold text-orange-600 text-base mt-0.5">05 Jun 2026</p>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-3">
                      <button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded-xl text-xs transition-colors">
                        {t('profilePayInstallment')}
                      </button>
                      <button className="flex-1 bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-2 rounded-xl text-xs transition-colors">
                        {t('profileCancelPledge')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

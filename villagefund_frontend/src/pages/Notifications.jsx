import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Award,
  Calendar,
  Banknote,
  Eye,
  CheckCheck,
  Megaphone,
  ArrowRight
} from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await getNotifications();
      setNotifications(data.results || data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationRead(id);
      // Update state locally
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Failed to mark all as read", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'CONTRIBUTION_APPROVED':
        return <Banknote className="w-5 h-5 text-green-600" />;
      case 'NEW_CAMPAIGN':
        return <Megaphone className="w-5 h-5 text-orange-600" />;
      case 'EXPENSE_POSTED':
        return <Banknote className="w-5 h-5 text-blue-600" />;
      case 'PLEDGE_DUE':
        return <Calendar className="w-5 h-5 text-amber-600" />;
      case 'BADGE_EARNED':
        return <Award className="w-5 h-5 text-yellow-500 animate-bounce" />;
      case 'FLAG_RAISED':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return 'bg-white border-gray-150';
    switch (type) {
      case 'CONTRIBUTION_APPROVED':
        return 'bg-green-50/50 border-green-200';
      case 'NEW_CAMPAIGN':
        return 'bg-orange-50/30 border-orange-200';
      case 'EXPENSE_POSTED':
        return 'bg-blue-50/30 border-blue-200';
      case 'BADGE_EARNED':
        return 'bg-yellow-50/30 border-yellow-200';
      case 'FLAG_RAISED':
        return 'bg-red-50/30 border-red-200';
      default:
        return 'bg-orange-50/10 border-orange-100';
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF7] py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b pb-6 border-gray-200">
          <div>
            <h1 className="text-3xl font-black font-heading text-gray-800 flex items-center gap-3">
              Notification Hub
              {unreadCount > 0 && (
                <span className="text-xs bg-orange-500 text-white font-black px-2.5 py-1 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </h1>
            <p className="text-gray-500 text-sm mt-1">Stay updated with campaigns, milestones, and expense approvals in Sundarpur.</p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1.5 bg-orange-100 hover:bg-orange-200 text-orange-700 font-extrabold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All as Read
            </button>
          )}
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-500 font-bold">Loading your notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center shadow-sm max-w-xl mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-gray-800 font-heading">No notifications yet</h3>
            <p className="text-gray-500 text-sm mt-1">We will notify you when new campaigns launch, or when your payments are approved!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {notifications.map((n) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex items-start gap-4 shadow-sm hover:shadow-md ${getNotificationColor(
                    n.type,
                    n.is_read
                  )}`}
                >
                  <div className={`p-3 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-inner`}>
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className={`font-black font-heading text-sm text-gray-800`}>{n.title}</h4>
                      <span className="text-[10px] text-gray-400 font-bold whitespace-nowrap">
                        {new Date(n.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-semibold">{n.body}</p>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      {n.campaign && (
                        <Link
                          to={`/campaigns/${n.campaign}`}
                          onClick={() => handleMarkAsRead(n.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-black text-orange-600 hover:text-orange-700 hover:underline"
                        >
                          View Campaign
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-400 hover:text-orange-600"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>

                  {!n.is_read && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2.5"></div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

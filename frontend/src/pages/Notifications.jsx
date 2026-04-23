import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead, } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Bell, CalendarDays, Wrench, MessageSquare, Info, Check, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
export function Notifications() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
        if (!user)
                return;
            setIsLoading(true);
            try {
                const data = await getNotifications(user.id);
                setNotifications(data);
            }
            catch (error) {
                console.error('Failed to fetch notifications', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);
    const handleMarkAsRead = async (id) => {
        await markNotificationAsRead(id);
        setNotifications((current) => current.map((n) => n.id === id
            ? {
                ...n,
                read: true,
            }
            : n));
    };
    const handleMarkAllAsRead = async () => {
        if (!user)
            return;
        await markAllNotificationsAsRead(user.id);
        setNotifications((current) => current.map((n) => ({
            ...n,
            read: true,
        })));
    };
    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            handleMarkAsRead(notification.id);
        }
        if (notification.relatedId) {
            if (notification.type === 'BOOKING')
                navigate(`/bookings`);
            if (notification.type === 'TICKET' || notification.type === 'COMMENT')
                navigate(`/tickets/${notification.relatedId}`);
        }
    };
    const getIcon = (type) => {
        switch (type) {
            case 'BOOKING':
                return <CalendarDays className="w-5 h-5 text-blue-500"/>;
            case 'TICKET':
                return <Wrench className="w-5 h-5 text-orange-500"/>;
            case 'COMMENT':
                return <MessageSquare className="w-5 h-5 text-green-500"/>;
            case 'SYSTEM':
                return <Bell className="w-5 h-5 text-violet-500"/>;
            default:
                return <Info className="w-5 h-5 text-slate-500"/>;
        }
    };
    if (isLoading)
        return <LoadingSpinner fullPage/>;
    const unreadCount = notifications.filter((n) => !n.read).length;
    return (<div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-slate-500 mt-1">Stay updated on your activity.</p>
        </div>
        {unreadCount > 0 && (<button onClick={handleMarkAllAsRead} className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
            <Check className="w-4 h-4 mr-1"/> Mark all as read
          </button>)}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {notifications.length === 0 ? (<div className="p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4"/>
            <h3 className="text-lg font-medium text-slate-900">
              All caught up!
            </h3>
            <p className="text-slate-500 mt-1">
              You don't have any notifications right now.
            </p>
          </div>) : (<div className="divide-y divide-slate-100">
            <AnimatePresence>
              {notifications.map((notification) => (<motion.div key={notification.id} initial={{
                    opacity: 0,
                    y: 10,
                }} animate={{
                    opacity: 1,
                    y: 0,
                }} exit={{
                    opacity: 0,
                    height: 0,
                }} onClick={() => handleNotificationClick(notification)} className={`p-5 flex items-start gap-4 cursor-pointer transition-colors ${notification.read ? 'bg-white hover:bg-slate-50' : 'bg-primary-50/50 hover:bg-primary-50'}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.read ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                    {getIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${notification.read ? 'text-slate-600' : 'text-slate-900 font-medium'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>

                  {!notification.read && (<div className="w-2.5 h-2.5 bg-primary-500 rounded-full shrink-0 mt-2"/>)}
                </motion.div>))}
            </AnimatePresence>
          </div>)}
      </div>
    </div>);
}

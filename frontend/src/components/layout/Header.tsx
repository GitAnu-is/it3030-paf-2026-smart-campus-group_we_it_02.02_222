import React, { useEffect, useState, useRef } from 'react';
import { BellIcon, MenuIcon, CheckIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
interface HeaderProps {
  currentPage: string;
  onMenuClick: () => void;
  navigate: (page: string) => void;
}
export function Header({ currentPage, onMenuClick, navigate }: HeaderProps) {
  const { user } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } =
  useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const myNotifications = notifications.filter(
    (n) =>
    n.userId === user?.id || user?.role === 'ADMIN' && n.userId === 'admin'
  );
  const unreadCount = myNotifications.filter((n) => !n.read).length;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
      notifRef.current &&
      !notifRef.current.contains(event.target as Node))
      {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const pageTitle = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
  const handleNotifClick = (notif: any) => {
    markNotificationRead(notif.id);
    if (notif.linkTo) {
      navigate(notif.linkTo);
    }
    setShowNotifications(false);
  };
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-20 sticky top-0">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          
          <MenuIcon className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold text-slate-800">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative transition-colors"
            aria-label="Notifications">
            
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 &&
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            }
          </button>

          {showNotifications &&
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                {unreadCount > 0 &&
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                
                    Mark all read
                  </button>
              }
              </div>
              <div className="max-h-96 overflow-y-auto">
                {myNotifications.length === 0 ?
              <div className="p-8 text-center text-slate-500 text-sm">
                    No notifications yet
                  </div> :

              myNotifications.map((notif) =>
              <div
                key={notif.id}
                onClick={() => handleNotifClick(notif)}
                className={`p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors ${!notif.read ? 'bg-indigo-50/30' : ''}`}>
                
                      <div className="flex justify-between items-start mb-1">
                        <h4
                    className={`text-sm font-medium ${!notif.read ? 'text-slate-900' : 'text-slate-700'}`}>
                    
                          {notif.title}
                        </h4>
                        {!notif.read &&
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5"></span>
                  }
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {notif.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-2 block">
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </span>
                    </div>
              )
              }
              </div>
            </div>
          }
        </div>
      </div>
    </header>);

}
import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { LayoutDashboard, Building2, CalendarDays, Wrench, Bell, BarChart3, Database, Settings, LogOut, Menu, Search, ChevronLeft, } from 'lucide-react';
import { getNotifications } from '../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
export function Layout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [notifications, setNotifications] = useState([]);
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
            }
            else {
                setIsSidebarOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    useEffect(() => {
      let isMounted = true;
      const loadNotifications = async () => {
        if (!user) {
          if (isMounted) {
            setNotifications([]);
          }
          return;
        }
        const data = await getNotifications(user.id);
        if (isMounted) {
          setNotifications(data);
        }
      };
      loadNotifications();
      const handleNotificationsChanged = () => {
        loadNotifications();
      };
      window.addEventListener('uniops-notifications-changed', handleNotificationsChanged);
      window.addEventListener('storage', handleNotificationsChanged);
      return () => {
        isMounted = false;
        window.removeEventListener('uniops-notifications-changed', handleNotificationsChanged);
        window.removeEventListener('storage', handleNotificationsChanged);
      };
    }, [user]);
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    const unreadCount = notifications.filter((n) => !n.read).length;
    const navItems = [
        {
            path: '/',
            icon: LayoutDashboard,
            label: 'Dashboard',
            roles: ['USER', 'ADMIN', 'TECHNICIAN'],
        },
        {
            path: '/facilities',
            icon: Building2,
            label: 'Facilities',
            roles: ['USER', 'ADMIN', 'TECHNICIAN'],
        },
        {
            path: '/bookings',
            icon: CalendarDays,
            label: 'Bookings',
            roles: ['USER', 'ADMIN'],
        },
        {
            path: '/tickets',
            icon: Wrench,
            label: 'Tickets',
            roles: ['USER', 'ADMIN', 'TECHNICIAN'],
        },
        {
            path: '/notifications',
            icon: Bell,
            label: 'Notifications',
            roles: ['USER', 'ADMIN', 'TECHNICIAN'],
            badge: unreadCount,
        },
        {
            path: '/analytics',
            icon: BarChart3,
            label: 'Analytics',
            roles: ['ADMIN'],
        },
        {
            path: '/manage-resources',
            icon: Database,
            label: 'Manage Resources',
            roles: ['ADMIN'],
        },
        {
            path: '/settings',
            icon: Settings,
            label: 'Settings',
            roles: ['USER', 'ADMIN', 'TECHNICIAN'],
        },
    ];
    const filteredNavItems = navItems.filter((item) => user && item.roles.includes(user.role));
    // Get page title based on current path
    const getPageTitle = () => {
        const path = location.pathname;
        if (path === '/')
            return 'Dashboard';
        const item = navItems.find((i) => path.startsWith(i.path) && i.path !== '/');
        if (item)
            return item.label;
        if (path.includes('/checkin'))
            return 'QR Check-in';
        return 'UniOps Platform';
    };
    return (<div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <motion.aside initial={false} animate={{
            width: isSidebarOpen ? 256 : isMobile ? 0 : 80,
            opacity: isMobile && !isSidebarOpen ? 0 : 1,
        }} className={`fixed md:relative z-30 h-full bg-slate-900 text-slate-300 flex flex-col transition-all duration-300 ease-in-out ${isMobile && !isSidebarOpen ? 'pointer-events-none' : ''}`}>
        <div className="h-16 flex items-center px-4 border-b border-slate-800">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white"/>
          </div>
          <AnimatePresence>
            {isSidebarOpen && (<motion.span initial={{
                opacity: 0,
                width: 0,
            }} animate={{
                opacity: 1,
                width: 'auto',
            }} exit={{
                opacity: 0,
                width: 0,
            }} className="ml-3 font-semibold text-white whitespace-nowrap overflow-hidden">
                UniOps
              </motion.span>)}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNavItems.map((item) => (<NavLink key={item.path} to={item.path} className={({ isActive }) => `
                flex items-center px-3 py-2.5 rounded-lg transition-colors group relative
                ${isActive ? 'bg-primary-600 text-white' : 'hover:bg-slate-800 hover:text-white'}
              `} title={!isSidebarOpen ? item.label : undefined}>
              <item.icon className={`w-5 h-5 shrink-0 ${!isSidebarOpen ? 'mx-auto' : ''}`}/>

              <AnimatePresence>
                {isSidebarOpen && (<motion.span initial={{
                    opacity: 0,
                    width: 0,
                }} animate={{
                    opacity: 1,
                    width: 'auto',
                }} exit={{
                    opacity: 0,
                    width: 0,
                }} className="ml-3 whitespace-nowrap overflow-hidden flex-1">
                    {item.label}
                  </motion.span>)}
              </AnimatePresence>

              {item.badge ? (<span className={`
                  absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center
                  bg-red-500 text-white text-[10px] font-bold rounded-full
                  ${isSidebarOpen ? 'w-5 h-5' : 'w-2 h-2 right-1 top-2'}
                `}>
                  {isSidebarOpen ? item.badge : ''}
                </span>) : null}
            </NavLink>))}
        </div>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className={`flex items-center w-full px-3 py-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ${!isSidebarOpen ? 'justify-center' : ''}`} title={!isSidebarOpen ? 'Logout' : undefined}>
            <LogOut className="w-5 h-5 shrink-0"/>
            <AnimatePresence>
              {isSidebarOpen && (<motion.span initial={{
                opacity: 0,
                width: 0,
            }} animate={{
                opacity: 1,
                width: 'auto',
            }} exit={{
                opacity: 0,
                width: 0,
            }} className="ml-3 whitespace-nowrap overflow-hidden">
                  Logout
                </motion.span>)}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      {isMobile && isSidebarOpen && (<div className="fixed inset-0 bg-slate-900/50 z-20" onClick={() => setIsSidebarOpen(false)}/>)}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-10 shrink-0">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
              {isSidebarOpen && !isMobile ? (<ChevronLeft className="w-5 h-5"/>) : (<Menu className="w-5 h-5"/>)}
            </button>
            <h1 className="text-lg font-semibold text-slate-900 hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
              <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-slate-100 border-transparent rounded-lg text-sm outline-none focus:outline-none focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all w-64"/>
            </div>

            <button onClick={() => navigate('/notifications')} className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5"/>
              {unreadCount > 0 && (<span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>)}
            </button>

            <div className="flex items-center pl-2 sm:pl-4 border-l border-slate-200">
              <div className="text-right mr-3 hidden sm:block">
                <p className="text-sm font-medium text-slate-900 leading-none mb-1">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500 leading-none">
                  {user?.role}
                </p>
              </div>
              <img src={user?.avatar ||
            `https://ui-avatars.com/api/?name=${user?.name}&background=6366f1&color=fff`} alt={user?.name} className="w-9 h-9 rounded-full border border-slate-200"/>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{
            opacity: 0,
            y: 10,
        }} animate={{
            opacity: 1,
            y: 0,
        }} exit={{
            opacity: 0,
            y: -10,
        }} transition={{
            duration: 0.2,
        }} className="h-full">
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>);
}

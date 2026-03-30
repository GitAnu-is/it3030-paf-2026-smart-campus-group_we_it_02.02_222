import React from 'react';
import {
  LayoutDashboardIcon,
  BuildingIcon,
  CalendarIcon,
  WrenchIcon,
  GraduationCapIcon,
  LogOutIcon,
  MenuIcon,
  XIcon } from
'lucide-react';
import { useAuth } from '../../context/AuthContext';
interface SidebarProps {
  currentPage: string;
  navigate: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}
export function Sidebar({
  currentPage,
  navigate,
  isOpen,
  setIsOpen
}: SidebarProps) {
  const { user, logout } = useAuth();
  const navItems = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboardIcon
  },
  {
    id: 'resources',
    label: 'Resources',
    icon: BuildingIcon
  },
  {
    id: 'bookings',
    label: 'Bookings',
    icon: CalendarIcon
  },
  {
    id: 'tickets',
    label: 'Tickets',
    icon: WrenchIcon
  }];

  const handleNav = (id: string) => {
    navigate(id);
    setIsOpen(false);
  };
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out flex flex-col
    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 md:static md:inset-0
  `;
  return (
    <>
      {/* Mobile overlay */}
      {isOpen &&
      <div
        className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm"
        onClick={() => setIsOpen(false)} />

      }

      <aside className={sidebarClasses}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
          <div className="flex items-center gap-3 text-white">
            <GraduationCapIcon className="w-8 h-8 text-indigo-500" />
            <span className="text-xl font-bold tracking-tight">UniOps</span>
          </div>
          <button
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsOpen(false)}>
            
            <XIcon className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                  ${isActive ? 'bg-indigo-600/10 text-indigo-400 border-l-2 border-indigo-500' : 'hover:bg-slate-800 hover:text-white border-l-2 border-transparent'}
                `}>
                
                <Icon
                  className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-white'}`} />
                
                <span className="font-medium">{item.label}</span>
              </button>);

          })}
        </nav>

        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={user?.avatarUrl}
              alt={user?.name}
              className="w-10 h-10 rounded-full border-2 border-slate-700" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            
            <LogOutIcon className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>);

}
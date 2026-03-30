import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
interface AppShellProps {
  children: React.ReactNode;
  currentPage: string;
  navigate: (page: string) => void;
}
export function AppShell({ children, currentPage, navigate }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <Sidebar
        currentPage={currentPage}
        navigate={navigate}
        isOpen={sidebarOpen}
        setIsOpen={setSidebarOpen} />
      

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          currentPage={currentPage}
          onMenuClick={() => setSidebarOpen(true)}
          navigate={navigate} />
        

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>);

}
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppShell } from './components/layout/AppShell';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { BookingsPage } from './pages/BookingsPage';
import { TicketsPage } from './pages/TicketsPage';
function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  if (!isAuthenticated) {
    return <LoginPage />;
  }
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage navigate={setCurrentPage} />;
      case 'resources':
        return <ResourcesPage />;
      case 'bookings':
        return <BookingsPage />;
      case 'tickets':
        return <TicketsPage />;
      default:
        return <DashboardPage navigate={setCurrentPage} />;
    }
  };
  return (
    <AppProvider>
      <AppShell currentPage={currentPage} navigate={setCurrentPage}>
        {renderPage()}
      </AppShell>
    </AppProvider>);

}
export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>);

}
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Facilities } from './pages/Facilities';
import { ResourceDetail } from './pages/ResourceDetail';
import { Bookings } from './pages/Bookings';
import { NewBooking } from './pages/NewBooking';
import { Tickets } from './pages/Tickets';
import { NewTicket } from './pages/NewTicket';
import { TicketDetail } from './pages/TicketDetail';
import { Notifications } from './pages/Notifications';
import { Analytics } from './pages/Analytics';
import { CheckIn } from './pages/CheckIn';
import { Settings } from './pages/Settings';
import { LoadingSpinner } from './components/LoadingSpinner';
// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles, }) => {
    const { user, isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
        return <LoadingSpinner fullPage/>;
    }
    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>;
    }
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace/>;
    }
    return <>{children}</>;
};
function AppRoutes() {
    return (<Routes>
      <Route path="/login" element={<Login />}/>

      <Route path="/" element={<ProtectedRoute>
            <Layout />
          </ProtectedRoute>}>
        <Route index element={<Dashboard />}/>

        <Route path="facilities" element={<Facilities />}/>
        <Route path="facilities/:id" element={<ResourceDetail />}/>

        <Route path="bookings" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
              <Bookings />
            </ProtectedRoute>}/>
        <Route path="bookings/new" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
              <NewBooking />
            </ProtectedRoute>}/>

        <Route path="tickets" element={<Tickets />}/>
        <Route path="tickets/new" element={<NewTicket />}/>
        <Route path="tickets/:id" element={<TicketDetail />}/>

        <Route path="notifications" element={<Notifications />}/>

        <Route path="analytics" element={<ProtectedRoute allowedRoles={['ADMIN']}>
              <Analytics />
            </ProtectedRoute>}/>

        <Route path="settings" element={<Settings />}/>
      </Route>

      <Route path="/checkin/:bookingId" element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']}>
            <CheckIn />
          </ProtectedRoute>}/>

      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>);
}
export function App() {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    const AppShell = (<AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>);

    if (!googleClientId) {
        return AppShell;
    }

    return (<GoogleOAuthProvider clientId={googleClientId}>
        {AppShell}
      </GoogleOAuthProvider>);
}

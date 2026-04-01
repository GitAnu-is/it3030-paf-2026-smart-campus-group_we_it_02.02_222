import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import {
  CalendarIcon,
  WrenchIcon,
  ClockIcon,
  CheckCircleIcon } from
'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line } from
'recharts';
export function DashboardPage({ navigate }) {
  const { user } = useAuth();
  const { bookings, tickets, resources } = useApp();
  // User specific data
  const myBookings = bookings.filter((b) => b.userId === user?.id);
  const myTickets = tickets.filter((t) => t.reporterId === user?.id);
  const assignedTickets = tickets.filter((t) => t.assigneeId === user?.id);
  // Admin Analytics Data
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;
  const openTickets = tickets.filter((t) => t.status === 'OPEN').length;
  const bookingsByStatus = [
  {
    name: 'Approved',
    value: bookings.filter((b) => b.status === 'APPROVED').length
  },
  {
    name: 'Pending',
    value: bookings.filter((b) => b.status === 'PENDING').length
  },
  {
    name: 'Rejected',
    value: bookings.filter((b) => b.status === 'REJECTED').length
  },
  {
    name: 'Cancelled',
    value: bookings.filter((b) => b.status === 'CANCELLED').length
  }];

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6b7280'];
  const topResources = resources.
  map((r) => ({
    name: r.name,
    bookings: bookings.filter((b) => b.resourceId === r.id).length
  })).
  sort((a, b) => b.bookings - a.bookings).
  slice(0, 5);
  const renderUserDashboard = () =>
  <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">My Bookings</p>
            <p className="text-2xl font-bold text-slate-900">
              {myBookings.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Pending Approvals
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {myBookings.filter((b) => b.status === 'PENDING').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <WrenchIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">My Tickets</p>
            <p className="text-2xl font-bold text-slate-900">
              {myTickets.length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">Recent Bookings</h2>
            <button
            onClick={() => navigate('bookings')}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {myBookings.slice(0, 4).map((booking) => {
            const resource = resources.find(
              (r) => r.id === booking.resourceId
            );
            return (
              <div
                key={booking.id}
                className="p-4 flex justify-between items-center">
                
                  <div>
                    <p className="font-medium text-slate-900">
                      {resource?.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {booking.date} • {booking.startTime} - {booking.endTime}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} type="booking" />
                </div>);

          })}
            {myBookings.length === 0 &&
          <div className="p-8 text-center text-slate-500">
                No bookings yet.
              </div>
          }
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-semibold text-slate-800">Recent Tickets</h2>
            <button
            onClick={() => navigate('tickets')}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
            
              View All
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {myTickets.slice(0, 4).map((ticket) =>
          <div
            key={ticket.id}
            className="p-4 flex justify-between items-center">
            
                <div>
                  <p className="font-medium text-slate-900 truncate max-w-[200px]">
                    {ticket.description}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={ticket.status} type="ticket" />
              </div>
          )}
            {myTickets.length === 0 &&
          <div className="p-8 text-center text-slate-500">
                No tickets reported.
              </div>
          }
          </div>
        </div>
      </div>
    </div>;

  const renderAdminDashboard = () =>
  <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium mb-1">
            Total Resources
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {resources.length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium mb-1">
            Pending Bookings
          </p>
          <p className="text-2xl font-bold text-amber-600">{pendingBookings}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium mb-1">
            Open Tickets
          </p>
          <p className="text-2xl font-bold text-blue-600">{openTickets}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500 font-medium mb-1">
            Total Bookings
          </p>
          <p className="text-2xl font-bold text-slate-900">{bookings.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            Top Booked Resources
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topResources}>
                <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f1f5f9" />
              
                <XAxis
                dataKey="name"
                tick={{
                  fontSize: 12
                }}
                tickLine={false}
                axisLine={false} />
              
                <YAxis
                tickLine={false}
                axisLine={false}
                tick={{
                  fontSize: 12
                }} />
              
                <Tooltip
                cursor={{
                  fill: '#f8fafc'
                }}
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} />
              
                <Bar dataKey="bookings" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">
            Bookings by Status
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                data={bookingsByStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value">
                
                  {bookingsByStatus.map((entry, index) =>
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]} />

                )}
                </Pie>
                <Tooltip
                contentStyle={{
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }} />
              
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>;

  const renderTechDashboard = () =>
  <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
            <WrenchIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Assigned to Me</p>
            <p className="text-2xl font-bold text-slate-900">
              {assignedTickets.length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
            <ClockIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">In Progress</p>
            <p className="text-2xl font-bold text-slate-900">
              {assignedTickets.filter((t) => t.status === 'IN_PROGRESS').length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-lg">
            <CheckCircleIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">
              Resolved (Total)
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {assignedTickets.filter((t) => t.status === 'RESOLVED').length}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-semibold text-slate-800">My Active Tickets</h2>
          <button
          onClick={() => navigate('tickets')}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
          
            View All
          </button>
        </div>
        <div className="divide-y divide-slate-100">
          {assignedTickets.
        filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').
        map((ticket) =>
        <div
          key={ticket.id}
          className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
          
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-400 uppercase">
                      {ticket.id}
                    </span>
                    <StatusBadge status={ticket.priority} type="priority" />
                  </div>
                  <p className="font-medium text-slate-900">
                    {ticket.description}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {ticket.location}
                  </p>
                </div>
                <StatusBadge status={ticket.status} type="ticket" />
              </div>
        )}
          {assignedTickets.filter(
          (t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS'
        ).length === 0 &&
        <div className="p-8 text-center text-slate-500">
              No active tickets assigned to you.
            </div>
        }
        </div>
      </div>
    </div>;

  return (
    <div className="pb-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening today.</p>
      </div>

      {user?.role === 'ADMIN' && renderAdminDashboard()}
      {user?.role === 'TECHNICIAN' && renderTechDashboard()}
      {user?.role === 'USER' && renderUserDashboard()}
    </div>);

}
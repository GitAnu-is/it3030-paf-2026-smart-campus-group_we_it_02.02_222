import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getBookings, getTickets, getResources } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, } from 'recharts';
import { BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
export function Analytics() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [resources, setResources] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [bData, tData, rData] = await Promise.all([
                    getBookings(),
                    getTickets(),
                    getResources(),
                ]);
                setBookings(bData);
                setTickets(tData);
                setResources(rData);
            }
            catch (error) {
                console.error('Failed to fetch analytics data', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        if (user?.role === 'ADMIN') {
            fetchData();
        }
    }, [user]);
    if (user?.role !== 'ADMIN') {
        return <Navigate to="/" replace/>;
    }
    if (isLoading)
        return <LoadingSpinner fullPage/>;
    // Prepare Data for Charts
    // 1. Bookings by Resource Type
    const bookingsByType = resources.reduce((acc, resource) => {
        const count = bookings.filter((b) => b.resourceId === resource.id).length;
        const type = resource.type.replace('_', ' ');
        acc[type] = (acc[type] || 0) + count;
        return acc;
    }, {});
    const barChartData = Object.entries(bookingsByType).map(([name, value]) => ({
        name,
        value,
    }));
    // 2. Tickets by Category
    const ticketsByCategory = tickets.reduce((acc, ticket) => {
        const cat = ticket.category.replace('_', ' ');
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});
    const pieChartData = Object.entries(ticketsByCategory).map(([name, value]) => ({
        name,
        value,
    }));
    const COLORS = [
        '#6366f1',
        '#14b8a6',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6',
        '#64748b',
    ];
    // Summary Stats
    const totalBookings = bookings.length;
    const resolutionRate = tickets.length > 0
        ? Math.round((tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length /
            tickets.length) *
            100)
        : 0;
    return (<div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Analytics</h1>
        <p className="text-slate-500 mt-1">
          Overview of platform usage and performance.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mr-4">
            <BarChart3 className="w-6 h-6 text-indigo-600"/>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Platform Bookings
            </p>
            <p className="text-2xl font-bold text-slate-900">{totalBookings}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mr-4">
            <TrendingUp className="w-6 h-6 text-green-600"/>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Ticket Resolution Rate
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {resolutionRate}%
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center">
          <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center mr-4">
            <AlertTriangle className="w-6 h-6 text-amber-600"/>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">
              Critical Issues
            </p>
            <p className="text-2xl font-bold text-slate-900">
              {tickets.filter((t) => t.priority === 'CRITICAL' && t.status !== 'CLOSED').length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Bookings by Resource Type
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{
            top: 20,
            right: 30,
            left: 0,
            bottom: 5,
        }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
            fill: '#64748b',
            fontSize: 12,
        }}/>
                <YAxis axisLine={false} tickLine={false} tick={{
            fill: '#64748b',
            fontSize: 12,
        }}/>
                <Tooltip cursor={{
            fill: '#f1f5f9',
        }} contentStyle={{
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }}/>
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 mb-6">
            Tickets by Category
          </h2>
          <div className="h-80 flex items-center justify-center">
            {tickets.length > 0 ? (<ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                    {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]}/>))}
                  </Pie>
                  <Tooltip contentStyle={{
                borderRadius: '8px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            }}/>
                </PieChart>
              </ResponsiveContainer>) : (<p className="text-slate-500">No ticket data available.</p>)}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieChartData.map((entry, index) => (<div key={entry.name} className="flex items-center text-sm text-slate-600">
                <div className="w-3 h-3 rounded-full mr-2" style={{
                backgroundColor: COLORS[index % COLORS.length],
            }}/>
                {entry.name}
              </div>))}
          </div>
        </div>
      </div>
    </div>);
}

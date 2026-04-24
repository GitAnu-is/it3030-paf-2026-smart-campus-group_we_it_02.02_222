import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getBookings, getTickets, getResources } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { CalendarDays, Wrench, Building2, Clock, ArrowRight, Plus, } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
export function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [resources, setResources] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [bData, tData, rData] = await Promise.all([
                    getBookings(user?.role === 'USER'
                        ? {
                            userId: user.id,
                        }
                        : undefined),
                    getTickets(user?.role === 'USER'
                        ? {
                            userId: user.id,
                        }
                        : user?.role === 'TECHNICIAN'
                            ? {
                                assignedTo: user.id,
                            }
                            : undefined),
                    getResources(),
                ]);
                setBookings(bData);
                setTickets(tData);
                setResources(rData);
            }
            catch (error) {
                console.error('Failed to fetch dashboard data', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        if (user) {
            fetchData();
        }
    }, [user]);
    if (isLoading) {
        return <LoadingSpinner fullPage/>;
    }
    // Calculate stats
    const pendingBookings = bookings.filter((b) => b.status === 'PENDING').length;
    const openTickets = tickets.filter((t) => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
    const activeResources = resources.filter((r) => r.status === 'ACTIVE').length;
    const myBookingsCount = bookings.filter((b) => b.userId === user?.id).length;
    const getResourceName = (id) => resources.find((r) => r.id === id)?.name || 'Unknown Resource';
    const containerVariants = {
        hidden: {
            opacity: 0,
        },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };
    const itemVariants = {
        hidden: {
            opacity: 0,
            y: 20,
        },
        show: {
            opacity: 1,
            y: 0,
        },
    };
    return (<div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 mt-1">
            Here's what's happening on campus today.
          </p>
        </div>
        <div className="flex gap-3">
          {user?.role !== 'TECHNICIAN' && (<button onClick={() => navigate('/bookings/new')} className="inline-flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
              <CalendarDays className="w-4 h-4 mr-2 text-slate-500"/>
              Book Resource
            </button>)}
          <button onClick={() => navigate('/tickets/new')} className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-primary-700 shadow-sm transition-colors">
            <Plus className="w-4 h-4 mr-2"/>
            Report Issue
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Total Bookings
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {user?.role === 'USER' ? myBookingsCount : bookings.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
              <CalendarDays className="w-6 h-6 text-primary-600"/>
            </div>
          </div>
        </motion.div>

        {(user?.role === 'ADMIN' || user?.role === 'USER') && (<motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Pending Approvals
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {pendingBookings}
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600"/>
              </div>
            </div>
          </motion.div>)}

        <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {user?.role === 'TECHNICIAN'
            ? 'My Open Tickets'
            : 'Open Tickets'}
              </p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                {openTickets}
              </p>
            </div>
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
              <Wrench className="w-6 h-6 text-red-600"/>
            </div>
          </div>
        </motion.div>

        {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (<motion.div variants={itemVariants} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Active Resources
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-2">
                  {activeResources}
                </p>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-teal-600"/>
              </div>
            </div>
          </motion.div>)}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        {user?.role !== 'TECHNICIAN' && (<motion.div initial={{
                opacity: 0,
                y: 20,
            }} animate={{
                opacity: 1,
                y: 0,
            }} transition={{
                delay: 0.2,
            }} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Bookings
              </h2>
              <Link to="/bookings" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
                View all <ArrowRight className="w-4 h-4 ml-1"/>
              </Link>
            </div>
            <div className="divide-y divide-slate-100 flex-1">
              {bookings.slice(0, 5).map((booking) => (<div key={booking.id} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-slate-900">
                      {getResourceName(booking.resourceId)}
                    </h3>
                    <StatusBadge status={booking.status}/>
                  </div>
                  <div className="flex items-center text-sm text-slate-500 space-x-4">
                    <span className="flex items-center">
                      <CalendarDays className="w-4 h-4 mr-1.5"/>
                      {booking.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1.5"/>
                      {booking.startTime} - {booking.endTime}
                    </span>
                  </div>
                </div>))}
              {bookings.length === 0 && (<div className="p-8 text-center text-slate-500">
                  No recent bookings found.
                </div>)}
            </div>
          </motion.div>)}

        {/* Recent Tickets */}
        <motion.div initial={{
            opacity: 0,
            y: 20,
        }} animate={{
            opacity: 1,
            y: 0,
        }} transition={{
            delay: 0.3,
        }} className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col ${user?.role === 'TECHNICIAN' ? 'lg:col-span-2' : ''}`}>
          <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Tickets
            </h2>
            <Link to="/tickets" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center">
              View all <ArrowRight className="w-4 h-4 ml-1"/>
            </Link>
          </div>
          <div className="divide-y divide-slate-100 flex-1">
            {tickets.slice(0, 5).map((ticket) => (<div key={ticket.id} className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {ticket.id}
                    </span>
                    <h3 className="font-medium text-slate-900 line-clamp-1">
                      {getResourceName(ticket.resourceId)}
                    </h3>
                  </div>
                  <StatusBadge status={ticket.status}/>
                </div>
                <p className="text-sm text-slate-600 line-clamp-1 mb-3">
                  {ticket.description}
                </p>
                <div className="flex items-center justify-between text-sm">
                  <PriorityBadge priority={ticket.priority}/>
                  <span className="text-slate-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>))}
            {tickets.length === 0 && (<div className="p-8 text-center text-slate-500">
                No recent tickets found.
              </div>)}
          </div>
        </motion.div>
      </div>
    </div>);
}

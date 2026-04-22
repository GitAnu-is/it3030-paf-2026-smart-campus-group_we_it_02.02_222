import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getTickets, getResources } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Wrench, Plus, Search, Clock, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
export function Tickets() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('MY_TICKETS');
    const [searchQuery, setSearchQuery] = useState('');
    useEffect(() => {
        // Set default tab based on role
        if (user?.role === 'TECHNICIAN')
            setActiveTab('ASSIGNED_TO_ME');
        else if (user?.role === 'ADMIN')
            setActiveTab('ALL');
        else
            setActiveTab('MY_TICKETS');
    }, [user]);
    useEffect(() => {
        fetchData();
    }, [user, activeTab]);
    const fetchData = async () => {
        setIsLoading(true);
        try {
            let filters = {};
            if (activeTab === 'MY_TICKETS')
                filters.userId = user?.id;
            if (activeTab === 'ASSIGNED_TO_ME')
                filters.assignedTo = user?.id;
            const [tData, rData] = await Promise.all([
                getTickets(filters),
                getResources(),
            ]);
            setTickets(tData);
            setResources(rData);
        }
        catch (error) {
            console.error('Failed to fetch tickets', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const getResourceName = (id) => resources.find((r) => r.id === id)?.name || 'Unknown Resource';
    const filteredTickets = tickets.filter((t) => t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getResourceName(t.resourceId)
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));
    // Calculate SLA (time since creation)
    const getSLA = (createdAt) => {
        const created = new Date(createdAt).getTime();
        const now = new Date().getTime();
        const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
        if (diffHours < 24)
            return `${diffHours}h ago`;
        return `${Math.floor(diffHours / 24)}d ago`;
    };
    return (<div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Maintenance Tickets
          </h1>
          <p className="text-slate-500 mt-1">
            Report and track facility issues.
          </p>
        </div>
        {(user?.role === 'USER' || user?.role === 'ADMIN') && (<button onClick={() => navigate('/tickets/new')} className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
            <Plus className="w-4 h-4 mr-2"/>
            New Ticket
          </button>)}
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
        {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (<div className="border-b border-slate-200">
            <nav className="-mb-px flex space-x-8">
              {user?.role === 'TECHNICIAN' && (<button onClick={() => setActiveTab('ASSIGNED_TO_ME')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'ASSIGNED_TO_ME' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                  Assigned to Me
                </button>)}
              <button onClick={() => setActiveTab('MY_TICKETS')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'MY_TICKETS' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                My Reported Issues
              </button>
              {user?.role === 'ADMIN' && (<button onClick={() => setActiveTab('ALL')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'ALL' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                  All Tickets
                </button>)}
            </nav>
          </div>)}

        <div className="relative max-w-md">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"/>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (<div className="p-12">
            <LoadingSpinner />
          </div>) : filteredTickets.length === 0 ? (<div className="p-12 text-center">
            <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4"/>
            <h3 className="text-lg font-medium text-slate-900">
              No tickets found
            </h3>
            <p className="text-slate-500 mt-1">
              There are no maintenance tickets matching your criteria.
            </p>
          </div>) : (<div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="p-4">Ticket</th>
                  <th className="p-4">Resource</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Priority</th>
                  <th className="p-4 hidden md:table-cell">Created</th>
                  <th className="p-4 hidden sm:table-cell">SLA</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredTickets.map((ticket, index) => (<motion.tr key={ticket.id} initial={{
                    opacity: 0,
                    y: 10,
                }} animate={{
                    opacity: 1,
                    y: 0,
                }} transition={{
                    delay: index * 0.05,
                }} onClick={() => navigate(`/tickets/${ticket.id}`)} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-mono text-xs text-slate-500 mb-1">
                          {ticket.id}
                        </span>
                        <span className="font-medium text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">
                          {ticket.category.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-slate-700 line-clamp-1">
                        {getResourceName(ticket.resourceId)}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={ticket.status}/>
                    </td>
                    <td className="p-4">
                      <PriorityBadge priority={ticket.priority}/>
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      <span className="text-sm text-slate-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 hidden sm:table-cell">
                      <div className="flex items-center text-sm text-slate-500">
                        <Clock className="w-4 h-4 mr-1.5 text-slate-400"/>
                        {getSLA(ticket.createdAt)}
                      </div>
                    </td>
                  </motion.tr>))}
              </tbody>
            </table>
          </div>)}
      </div>
    </div>);
}

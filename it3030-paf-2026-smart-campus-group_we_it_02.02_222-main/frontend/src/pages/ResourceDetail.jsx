import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResourceById, getTickets } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Users, MapPin, Clock, ArrowLeft, Wrench, AlertCircle, } from 'lucide-react';
export function ResourceDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resource, setResource] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            if (!id)
                return;
            setIsLoading(true);
            try {
                const [rData, tData] = await Promise.all([
                    getResourceById(id),
                    getTickets({
                        resourceId: id,
                    }),
                ]);
                setResource(rData);
                setTickets(tData);
            }
            catch (error) {
                console.error('Failed to fetch resource details', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);
    if (isLoading)
        return <LoadingSpinner fullPage/>;
    if (!resource)
        return <div className="p-8 text-center">Resource not found</div>;
    const activeTickets = tickets.filter((t) => t.status !== 'CLOSED' &&
        t.status !== 'RESOLVED' &&
        t.status !== 'REJECTED');
    return (<div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/facilities')} className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1"/> Back to Facilities
      </button>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-slate-800 to-slate-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"/>
          <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md text-xs font-semibold tracking-wider uppercase">
                  {resource.type.replace('_', ' ')}
                </span>
                <StatusBadge status={resource.status}/>
              </div>
              <h1 className="text-3xl font-bold">{resource.name}</h1>
            </div>
            <button onClick={() => navigate(`/bookings/new?resourceId=${resource.id}`)} disabled={resource.status === 'OUT_OF_SERVICE'} className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 disabled:bg-slate-500 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm transition-colors">
              Book Resource
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">
                Description
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {resource.description ||
            'No description available for this resource.'}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <MapPin className="w-5 h-5 text-slate-400 mr-3 mt-0.5"/>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Location
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {resource.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <Users className="w-5 h-5 text-slate-400 mr-3 mt-0.5"/>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Capacity
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Up to {resource.capacity} people
                    </p>
                  </div>
                </div>
                <div className="flex items-start p-4 bg-slate-50 rounded-xl border border-slate-100 sm:col-span-2">
                  <Clock className="w-5 h-5 text-slate-400 mr-3 mt-0.5"/>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      Availability Windows
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {resource.availabilityWindows}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            {/* Maintenance Status Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <h3 className="font-semibold text-slate-900 flex items-center">
                  <Wrench className="w-4 h-4 mr-2 text-slate-500"/>
                  Maintenance
                </h3>
                <span className="text-xs font-medium text-slate-500 bg-slate-200 px-2 py-1 rounded-full">
                  {activeTickets.length} Active
                </span>
              </div>
              <div className="p-4">
                {activeTickets.length > 0 ? (<div className="space-y-3">
                    {activeTickets.map((ticket) => (<div key={ticket.id} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                        <div className="flex justify-between items-start mb-1">
                          <PriorityBadge priority={ticket.priority}/>
                          <span className="text-xs text-slate-500">
                            {new Date(ticket.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mt-2 line-clamp-2">
                          {ticket.description}
                        </p>
                      </div>))}
                  </div>) : (<div className="text-center py-6">
                    <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-2">
                      <AlertCircle className="w-5 h-5 text-green-500"/>
                    </div>
                    <p className="text-sm text-slate-600">
                      No active maintenance issues.
                    </p>
                  </div>)}
                <button onClick={() => navigate(`/tickets/new?resourceId=${resource.id}`)} className="w-full mt-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  Report Issue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);
}

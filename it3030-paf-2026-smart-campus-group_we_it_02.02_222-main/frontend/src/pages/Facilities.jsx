import React, { useEffect, useState } from 'react';
import { getResources } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { Search, Filter, Users, MapPin, Building2, MonitorPlay, Beaker, UsersRound, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
export function Facilities() {
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState('ALL');
    const navigate = useNavigate();
    useEffect(() => {
        const fetchResources = async () => {
            setIsLoading(true);
            try {
                const data = await getResources();
                setResources(data);
            }
            catch (error) {
                console.error('Failed to fetch resources', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchResources();
    }, []);
    const filteredResources = resources.filter((r) => {
        const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = selectedType === 'ALL' || r.type === selectedType;
        return matchesSearch && matchesType;
    });
    const getTypeIcon = (type) => {
        switch (type) {
            case 'LECTURE_HALL':
                return <UsersRound className="w-5 h-5"/>;
            case 'LAB':
                return <Beaker className="w-5 h-5"/>;
            case 'MEETING_ROOM':
                return <Building2 className="w-5 h-5"/>;
            case 'EQUIPMENT':
                return <MonitorPlay className="w-5 h-5"/>;
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'LECTURE_HALL':
                return 'bg-indigo-100 text-indigo-600';
            case 'LAB':
                return 'bg-teal-100 text-teal-600';
            case 'MEETING_ROOM':
                return 'bg-blue-100 text-blue-600';
            case 'EQUIPMENT':
                return 'bg-orange-100 text-orange-600';
        }
    };
    const getGradient = (type) => {
        switch (type) {
            case 'LECTURE_HALL':
                return 'from-indigo-500 to-purple-600';
            case 'LAB':
                return 'from-teal-400 to-emerald-500';
            case 'MEETING_ROOM':
                return 'from-blue-500 to-cyan-500';
            case 'EQUIPMENT':
                return 'from-orange-400 to-red-500';
        }
    };
    if (isLoading)
        return <LoadingSpinner fullPage/>;
    return (<div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Facilities & Assets
          </h1>
          <p className="text-slate-500 mt-1">
            Browse and book university resources.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
          <input type="text" placeholder="Search by name or location..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"/>
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          <Filter className="w-5 h-5 text-slate-400 mr-2 shrink-0"/>
          {['ALL', 'LECTURE_HALL', 'LAB', 'MEETING_ROOM', 'EQUIPMENT'].map((type) => (<button key={type} onClick={() => setSelectedType(type)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedType === type ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {type === 'ALL' ? 'All Types' : type.replace('_', ' ')}
            </button>))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredResources.map((resource, index) => (<motion.div key={resource.id} initial={{
                opacity: 0,
                y: 20,
            }} animate={{
                opacity: 1,
                y: 0,
            }} transition={{
                delay: index * 0.05,
            }} onClick={() => navigate(`/facilities/${resource.id}`)} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md hover:border-primary-300 transition-all cursor-pointer group flex flex-col">
            <div className={`h-32 bg-gradient-to-br ${getGradient(resource.type)} relative`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"/>
              <div className="absolute top-3 right-3">
                <StatusBadge status={resource.status}/>
              </div>
              <div className={`absolute -bottom-5 left-4 w-10 h-10 rounded-lg flex items-center justify-center shadow-sm border-2 border-white ${getTypeColor(resource.type)}`}>
                {getTypeIcon(resource.type)}
              </div>
            </div>

            <div className="p-5 pt-8 flex-1 flex flex-col">
              <h3 className="font-semibold text-slate-900 text-lg mb-1 line-clamp-1">
                {resource.name}
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-4">
                {resource.type.replace('_', ' ')}
              </p>

              <div className="space-y-2 mt-auto">
                <div className="flex items-center text-sm text-slate-600">
                  <Users className="w-4 h-4 mr-2 text-slate-400 shrink-0"/>
                  <span>Capacity: {resource.capacity}</span>
                </div>
                <div className="flex items-start text-sm text-slate-600">
                  <MapPin className="w-4 h-4 mr-2 text-slate-400 shrink-0 mt-0.5"/>
                  <span className="line-clamp-2">{resource.location}</span>
                </div>
              </div>
            </div>
          </motion.div>))}
      </div>

      {filteredResources.length === 0 && (<div className="text-center py-12 bg-white rounded-xl border border-slate-200 border-dashed">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3"/>
          <h3 className="text-lg font-medium text-slate-900">
            No resources found
          </h3>
          <p className="text-slate-500">
            Try adjusting your search or filters.
          </p>
        </div>)}
    </div>);
}

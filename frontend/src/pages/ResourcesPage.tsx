import React, { useState } from 'react';
import {
  SearchIcon,
  FilterIcon,
  UsersIcon,
  MapPinIcon,
  LayoutGridIcon,
  ListIcon } from
'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import { Resource } from '../types';
export function ResourcesPage() {
  const { resources } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null
  );
  const filteredResources = resources.filter((r) => {
    const matchesSearch =
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'ALL' || r.type === typeFilter;
    return matchesSearch && matchesType;
  });
  const handleBookClick = (resource: Resource, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would navigate to bookings page with pre-filled resource
    alert(`Navigate to booking form for ${resource.name}`);
  };
  return (
    <div className="space-y-6 pb-8">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex-1 w-full md:w-auto relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search resources by name or location..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
          
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-48">
            <FilterIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <select
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}>
              
              <option value="ALL">All Types</option>
              <option value="LECTURE_HALL">Lecture Halls</option>
              <option value="LAB">Laboratories</option>
              <option value="MEETING_ROOM">Meeting Rooms</option>
              <option value="EQUIPMENT">Equipment</option>
            </select>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
              
              <LayoutGridIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}>
              
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          {user?.role === 'ADMIN' &&
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors whitespace-nowrap">
              Add Resource
            </button>
          }
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' &&
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredResources.map((resource) =>
        <div
          key={resource.id}
          onClick={() => setSelectedResource(resource)}
          className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group flex flex-col">
          
              <div className="h-48 overflow-hidden relative">
                <img
              src={resource.imageUrl}
              alt={resource.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            
                <div className="absolute top-3 right-3">
                  <StatusBadge status={resource.status} type="resource" />
                </div>
                <div className="absolute top-3 left-3 bg-slate-900/70 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded-md">
                  {resource.type.replace('_', ' ')}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-1">
                  {resource.name}
                </h3>
                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center text-sm text-slate-500">
                    <UsersIcon className="w-4 h-4 mr-2 text-slate-400" />
                    Capacity: {resource.capacity}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <MapPinIcon className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="line-clamp-1">{resource.location}</span>
                  </div>
                </div>
                <button
              onClick={(e) => handleBookClick(resource, e)}
              disabled={resource.status === 'OUT_OF_SERVICE'}
              className="w-full py-2 bg-indigo-50 text-indigo-600 font-medium rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              
                  Book Now
                </button>
              </div>
            </div>
        )}
        </div>
      }

      {/* List View */}
      {viewMode === 'list' &&
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 font-semibold text-slate-600 text-sm">
                  Resource
                </th>
                <th className="p-4 font-semibold text-slate-600 text-sm hidden md:table-cell">
                  Location
                </th>
                <th className="p-4 font-semibold text-slate-600 text-sm hidden sm:table-cell">
                  Capacity
                </th>
                <th className="p-4 font-semibold text-slate-600 text-sm">
                  Status
                </th>
                <th className="p-4 font-semibold text-slate-600 text-sm text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResources.map((resource) =>
            <tr
              key={resource.id}
              onClick={() => setSelectedResource(resource)}
              className="hover:bg-slate-50 transition-colors cursor-pointer">
              
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                    src={resource.imageUrl}
                    alt=""
                    className="w-10 h-10 rounded-lg object-cover hidden sm:block" />
                  
                      <div>
                        <p className="font-medium text-slate-900">
                          {resource.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {resource.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 hidden md:table-cell">
                    {resource.location}
                  </td>
                  <td className="p-4 text-sm text-slate-600 hidden sm:table-cell">
                    {resource.capacity}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={resource.status} type="resource" />
                  </td>
                  <td className="p-4 text-right">
                    <button
                  onClick={(e) => handleBookClick(resource, e)}
                  disabled={resource.status === 'OUT_OF_SERVICE'}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-medium rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                  
                      Book
                    </button>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }

      {filteredResources.length === 0 &&
      <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
          <BuildingIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900">
            No resources found
          </h3>
          <p className="text-slate-500">
            Try adjusting your search or filters.
          </p>
        </div>
      }

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        title="Resource Details"
        size="lg">
        
        {selectedResource &&
        <div className="space-y-6">
            <img
            src={selectedResource.imageUrl}
            alt={selectedResource.name}
            className="w-full h-64 object-cover rounded-xl" />
          

            <div>
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedResource.name}
                </h2>
                <StatusBadge status={selectedResource.status} type="resource" />
              </div>
              <p className="text-sm font-medium text-indigo-600 mb-4">
                {selectedResource.type.replace('_', ' ')}
              </p>
              <p className="text-slate-600 leading-relaxed">
                {selectedResource.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                  Location
                </p>
                <p className="text-slate-800 flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-slate-400" />
                  {selectedResource.location}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                  Capacity
                </p>
                <p className="text-slate-800 flex items-center gap-2">
                  <UsersIcon className="w-4 h-4 text-slate-400" />
                  {selectedResource.capacity} people
                </p>
              </div>
              <div className="md:col-span-2 mt-2">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">
                  Availability Windows
                </p>
                <p className="text-slate-800">
                  {selectedResource.availabilityWindows}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
              onClick={() => setSelectedResource(null)}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors">
              
                Close
              </button>
              <button
              disabled={selectedResource.status === 'OUT_OF_SERVICE'}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              
                Book Resource
              </button>
            </div>
          </div>
        }
      </Modal>
    </div>);

}
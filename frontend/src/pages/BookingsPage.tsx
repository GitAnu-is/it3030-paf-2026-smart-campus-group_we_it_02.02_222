import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { Modal } from '../components/common/Modal';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  FileTextIcon,
  AlertCircleIcon,
  QrCodeIcon } from
'lucide-react';
export function BookingsPage() {
  const { bookings, resources, addBooking, updateBookingStatus } = useApp();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'MY' | 'ALL' | 'NEW'>('MY');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  // Form state
  const [formData, setFormData] = useState({
    resourceId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    attendees: 1
  });
  const [formError, setFormError] = useState('');
  const displayBookings = (
  activeTab === 'MY' ?
  bookings.filter((b) => b.userId === user?.id) :
  bookings).

  filter((b) => statusFilter === 'ALL' || b.status === statusFilter).
  sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (
    !formData.resourceId ||
    !formData.date ||
    !formData.startTime ||
    !formData.endTime ||
    !formData.purpose)
    {
      setFormError('Please fill in all required fields.');
      return;
    }
    if (formData.startTime >= formData.endTime) {
      setFormError('End time must be after start time.');
      return;
    }
    const result = addBooking({
      userId: user!.id,
      resourceId: formData.resourceId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      purpose: formData.purpose,
      attendees: Number(formData.attendees)
    });
    if (result.success) {
      setActiveTab('MY');
      setFormData({
        resourceId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
        attendees: 1
      });
    } else {
      setFormError(result.error || 'Failed to create booking.');
    }
  };
  const handleStatusUpdate = (id: string, status: any) => {
    updateBookingStatus(id, status);
    setSelectedBooking(null);
  };
  return (
    <div className="space-y-6 pb-8">
      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'MY' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('MY')}>
          
          My Bookings
        </button>
        {user?.role === 'ADMIN' &&
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'ALL' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('ALL')}>
          
            All Bookings
          </button>
        }
        <button
          className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'NEW' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('NEW')}>
          
          New Booking
        </button>
      </div>

      {/* List View */}
      {(activeTab === 'MY' || activeTab === 'ALL') &&
      <div className="space-y-4">
          <div className="flex justify-end">
            <select
            className="px-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}>
            
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 font-semibold text-slate-600 text-sm">
                      Resource
                    </th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">
                      Date & Time
                    </th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">
                      Purpose
                    </th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">
                      Status
                    </th>
                    <th className="p-4 font-semibold text-slate-600 text-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayBookings.map((booking) => {
                  const resource = resources.find(
                    (r) => r.id === booking.resourceId
                  );
                  return (
                    <tr
                      key={booking.id}
                      className="hover:bg-slate-50 transition-colors">
                      
                        <td className="p-4">
                          <p className="font-medium text-slate-900">
                            {resource?.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {resource?.type.replace('_', ' ')}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-slate-700 mb-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />{' '}
                            {booking.date}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <ClockIcon className="w-3.5 h-3.5 text-slate-400" />{' '}
                            {booking.startTime} - {booking.endTime}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-slate-700 line-clamp-2 max-w-xs">
                            {booking.purpose}
                          </p>
                        </td>
                        <td className="p-4">
                          <StatusBadge status={booking.status} type="booking" />
                        </td>
                        <td className="p-4">
                          <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                          
                            View Details
                          </button>
                        </td>
                      </tr>);

                })}
                </tbody>
              </table>
            </div>
            {displayBookings.length === 0 &&
          <div className="p-8 text-center text-slate-500">
                No bookings found.
              </div>
          }
          </div>
        </div>
      }

      {/* New Booking Form */}
      {activeTab === 'NEW' &&
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-100 p-6 md:p-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">
            Request a Resource
          </h2>

          {formError &&
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-700">
              <AlertCircleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{formError}</p>
            </div>
        }

          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Resource *
              </label>
              <select
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.resourceId}
              onChange={(e) =>
              setFormData({
                ...formData,
                resourceId: e.target.value
              })
              }
              required>
              
                <option value="">Select a resource...</option>
                {resources.
              filter((r) => r.status === 'ACTIVE').
              map((r) =>
              <option key={r.id} value={r.id}>
                      {r.name} ({r.type.replace('_', ' ')})
                    </option>
              )}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date *
                </label>
                <input
                type="date"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  date: e.target.value
                })
                }
                required />
              
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Expected Attendees
                </label>
                <input
                type="number"
                min="1"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.attendees}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  attendees: e.target.value
                })
                } />
              
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Start Time *
                </label>
                <input
                type="time"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.startTime}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  startTime: e.target.value
                })
                }
                required />
              
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  End Time *
                </label>
                <input
                type="time"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.endTime}
                onChange={(e) =>
                setFormData({
                  ...formData,
                  endTime: e.target.value
                })
                }
                required />
              
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Purpose *
              </label>
              <textarea
              rows={4}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Briefly describe what you'll use the resource for..."
              value={formData.purpose}
              onChange={(e) =>
              setFormData({
                ...formData,
                purpose: e.target.value
              })
              }
              required />
            
            </div>

            <div className="pt-4 flex justify-end">
              <button
              type="submit"
              className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
              
                Submit Request
              </button>
            </div>
          </form>
        </div>
      }

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
        title="Booking Details"
        size="md">
        
        {selectedBooking &&
        (() => {
          const resource = resources.find(
            (r) => r.id === selectedBooking.resourceId
          );
          return (
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {resource?.name}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {resource?.location}
                    </p>
                  </div>
                  <StatusBadge status={selectedBooking.status} type="booking" />
                </div>

                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Date</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedBooking.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                      <ClockIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Time</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {selectedBooking.startTime} - {selectedBooking.endTime}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
                    <FileTextIcon className="w-4 h-4 text-slate-400" /> Purpose
                  </h4>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    {selectedBooking.purpose}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <UsersIcon className="w-4 h-4 text-slate-400" />
                  <span className="font-medium">Expected Attendees:</span>{' '}
                  {selectedBooking.attendees}
                </div>

                {selectedBooking.adminNote &&
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-800 mb-1">
                      Admin Note:
                    </p>
                    <p className="text-sm text-amber-900">
                      {selectedBooking.adminNote}
                    </p>
                  </div>
              }

                {/* QR Code Innovation for Approved Bookings */}
                {selectedBooking.status === 'APPROVED' &&
              <div className="mt-6 p-6 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center text-center">
                    <div className="p-4 bg-white rounded-xl shadow-sm mb-3">
                      <QrCodeIcon className="w-24 h-24 text-slate-800" />
                    </div>
                    <h4 className="font-semibold text-slate-900">
                      Check-in QR Code
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Scan at the resource location to check in.
                    </p>
                  </div>
              }

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                  {user?.role === 'ADMIN' &&
                selectedBooking.status === 'PENDING' &&
                <>
                        <button
                    onClick={() =>
                    handleStatusUpdate(selectedBooking.id, 'REJECTED')
                    }
                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors">
                    
                          Reject
                        </button>
                        <button
                    onClick={() =>
                    handleStatusUpdate(selectedBooking.id, 'APPROVED')
                    }
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors">
                    
                          Approve
                        </button>
                      </>
                }

                  {(user?.id === selectedBooking.userId ||
                user?.role === 'ADMIN') && (
                selectedBooking.status === 'PENDING' ||
                selectedBooking.status === 'APPROVED') &&
                <button
                  onClick={() =>
                  handleStatusUpdate(selectedBooking.id, 'CANCELLED')
                  }
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors">
                  
                        Cancel Booking
                      </button>
                }
                </div>
              </div>);

        })()}
      </Modal>
    </div>);

}
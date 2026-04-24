import React, { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { getBookings, getResources, updateBookingStatus } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { CalendarDays, Clock, Users, Plus, QrCode, CheckCircle, XCircle, } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
export function Bookings() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [bookings, setBookings] = useState([]);
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('MY_BOOKINGS');
    // Modal state
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [actionType, setActionType] = useState(null);
    const [reason, setReason] = useState('');
    useEffect(() => {
        fetchData();
    }, [user, activeTab]);
    const fetchData = async () => {
        setIsLoading(true);
        try {
            let filters = {};
            if (activeTab === 'MY_BOOKINGS')
                filters.userId = user?.id;
            if (activeTab === 'PENDING')
                filters.status = 'PENDING';
            const [bData, rData] = await Promise.all([
                getBookings(filters),
                getResources(),
            ]);
            setBookings(bData);
            setResources(rData);
        }
        catch (error) {
            console.error('Failed to fetch bookings', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const getResourceName = (id) => resources.find((r) => r.id === id)?.name || 'Unknown Resource';
    const handleAction = async () => {
        if (!selectedBooking || !actionType)
            return;
        try {
            const status = actionType === 'APPROVE'
                ? 'APPROVED'
                : actionType === 'REJECT'
                    ? 'REJECTED'
                    : 'CANCELLED';
            await updateBookingStatus(selectedBooking.id, status, user?.id, reason);
            setIsActionModalOpen(false);
            setReason('');
            fetchData(); // Refresh list
        }
        catch (error) {
            console.error('Failed to update booking', error);
        }
    };
    const openActionModal = (booking, type) => {
        setSelectedBooking(booking);
        setActionType(type);
        setReason('');
        setIsActionModalOpen(true);
    };
    if (isLoading && bookings.length === 0)
        return <LoadingSpinner fullPage/>;
    return (<div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 mt-1">
            Manage your resource reservations.
          </p>
        </div>
        <button onClick={() => navigate('/bookings/new')} className="inline-flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-sm transition-colors">
          <Plus className="w-4 h-4 mr-2"/>
          New Booking
        </button>
      </div>

      {/* Tabs */}
      {user?.role === 'ADMIN' && (<div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8">
            <button onClick={() => setActiveTab('MY_BOOKINGS')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'MY_BOOKINGS' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              My Bookings
            </button>
            <button onClick={() => setActiveTab('PENDING')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === 'PENDING' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              Pending Approvals
              <span className="ml-2 bg-amber-100 text-amber-600 py-0.5 px-2 rounded-full text-xs">
                {bookings.filter((b) => b.status === 'PENDING').length}
              </span>
            </button>
            <button onClick={() => setActiveTab('ALL')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'ALL' ? 'border-primary-500 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              All Bookings
            </button>
          </nav>
        </div>)}

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (<div className="p-12">
            <LoadingSpinner />
          </div>) : bookings.length === 0 ? (<div className="p-12 text-center">
            <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-4"/>
            <h3 className="text-lg font-medium text-slate-900">
              No bookings found
            </h3>
            <p className="text-slate-500 mt-1">
              You don't have any bookings in this category.
            </p>
          </div>) : (<div className="divide-y divide-slate-200">
            {bookings.map((booking) => (<div key={booking.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {getResourceName(booking.resourceId)}
                      </h3>
                      <StatusBadge status={booking.status}/>
                    </div>
                    <p className="text-slate-600 text-sm mb-4">
                      {booking.purpose}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <CalendarDays className="w-4 h-4 mr-1.5"/>
                        {new Date(booking.date).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                })}
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1.5"/>
                        {booking.startTime} - {booking.endTime}
                      </span>
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1.5"/>
                        {booking.attendees} attendees
                      </span>
                    </div>

                    {booking.reason && (<div className="mt-3 p-3 bg-slate-100 rounded-lg text-sm text-slate-700 border border-slate-200">
                        <span className="font-medium">Note:</span>{' '}
                        {booking.reason}
                      </div>)}
                  </div>

                  <div className="flex items-center gap-2 md:flex-col md:items-end">
                    {booking.status === 'APPROVED' && (<button onClick={() => navigate(`/checkin/${booking.id}`)} className="flex items-center px-3 py-1.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors">
                        <QrCode className="w-4 h-4 mr-1.5"/> Check-in
                      </button>)}

                    {user?.role === 'ADMIN' && booking.status === 'PENDING' && (<div className="flex gap-2">
                        <button onClick={() => openActionModal(booking, 'APPROVE')} className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 text-sm font-medium rounded-lg hover:bg-green-100 transition-colors">
                          <CheckCircle className="w-4 h-4 mr-1.5"/> Approve
                        </button>
                        <button onClick={() => openActionModal(booking, 'REJECT')} className="flex items-center px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors">
                          <XCircle className="w-4 h-4 mr-1.5"/> Reject
                        </button>
                      </div>)}

                    {(booking.status === 'PENDING' ||
                    booking.status === 'APPROVED') && (<button onClick={() => openActionModal(booking, 'CANCEL')} className="flex items-center px-3 py-1.5 text-slate-500 text-sm font-medium hover:text-red-600 transition-colors">
                        Cancel Booking
                      </button>)}
                  </div>
                </div>
              </div>))}
          </div>)}
      </div>

      {/* Action Modal */}
      <Modal isOpen={isActionModalOpen} onClose={() => setIsActionModalOpen(false)} title={`${actionType === 'APPROVE' ? 'Approve' : actionType === 'REJECT' ? 'Reject' : 'Cancel'} Booking`}>
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to {actionType?.toLowerCase()} the booking for{' '}
            <strong>
              {selectedBooking
            ? getResourceName(selectedBooking.resourceId)
            : ''}
            </strong>
            ?
          </p>

          {(actionType === 'REJECT' || actionType === 'CANCEL') && (<div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reason (Optional)
              </label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" rows={3} placeholder="Provide a reason..."/>
            </div>)}

          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsActionModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              Close
            </button>
            <button onClick={handleAction} className={`px-4 py-2 text-sm font-medium text-white rounded-lg ${actionType === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
              Confirm{' '}
              {actionType === 'APPROVE'
            ? 'Approval'
            : actionType === 'REJECT'
                ? 'Rejection'
                : 'Cancellation'}
            </button>
          </div>
        </div>
      </Modal>
    </div>);
}

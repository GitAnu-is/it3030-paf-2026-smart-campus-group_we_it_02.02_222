import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBookings, getResources } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { QrCode, CheckCircle, ArrowLeft, CalendarDays, Clock, MapPin, } from 'lucide-react';
import { motion } from 'framer-motion';
export function CheckIn() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [resource, setResource] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const bookings = await getBookings();
                const foundBooking = bookings.find((b) => b.id === bookingId);
                if (foundBooking) {
                    setBooking(foundBooking);
                    const resources = await getResources();
                    setResource(resources.find((r) => r.id === foundBooking.resourceId) || null);
                }
            }
            catch (error) {
                console.error('Failed to fetch booking', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [bookingId]);
    const handleCheckIn = () => {
        setIsCheckedIn(true);
        // In a real app, this would call an API to update the check-in status
    };
    if (isLoading)
        return <LoadingSpinner fullPage/>;
    if (!booking || !resource)
        return <div className="p-8 text-center">Booking not found</div>;
    return (<div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <button onClick={() => navigate('/bookings')} className="absolute top-8 left-8 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1"/> Back to Bookings
      </button>

      <motion.div initial={{
            opacity: 0,
            scale: 0.95,
        }} animate={{
            opacity: 1,
            scale: 1,
        }} className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 max-w-md w-full text-center">
        {!isCheckedIn ? (<>
            <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-8 h-8 text-primary-600"/>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Resource Check-in
            </h1>
            <p className="text-slate-500 mb-8">
              Scan or confirm to access your booked resource.
            </p>

            <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left space-y-3 border border-slate-100">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-slate-400 mr-3 mt-0.5"/>
                <div>
                  <p className="font-medium text-slate-900">{resource.name}</p>
                  <p className="text-sm text-slate-500">{resource.location}</p>
                </div>
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <CalendarDays className="w-4 h-4 text-slate-400 mr-3"/>
                {booking.date}
              </div>
              <div className="flex items-center text-sm text-slate-700">
                <Clock className="w-4 h-4 text-slate-400 mr-3"/>
                {booking.startTime} - {booking.endTime}
              </div>
            </div>

            {/* Simulated QR Code Pattern */}
            <div className="w-48 h-48 mx-auto mb-8 bg-white p-2 border-2 border-slate-200 rounded-lg relative overflow-hidden">
              <div className="absolute inset-2 grid grid-cols-5 gap-1">
                {Array.from({
                length: 25,
            }).map((_, i) => (<div key={i} className={`bg-slate-800 rounded-sm ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}/>))}
              </div>
              {/* Corner markers */}
              <div className="absolute top-2 left-2 w-8 h-8 border-4 border-slate-800 rounded-sm"/>
              <div className="absolute top-2 right-2 w-8 h-8 border-4 border-slate-800 rounded-sm"/>
              <div className="absolute bottom-2 left-2 w-8 h-8 border-4 border-slate-800 rounded-sm"/>
            </div>

            <button onClick={handleCheckIn} className="w-full py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors shadow-sm">
              Confirm Check-in
            </button>
          </>) : (<motion.div initial={{
                opacity: 0,
                scale: 0.8,
            }} animate={{
                opacity: 1,
                scale: 1,
            }} className="py-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500"/>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Checked In Successfully!
            </h2>
            <p className="text-slate-500 mb-8">
              You now have access to {resource.name}.
            </p>
            <button onClick={() => navigate('/bookings')} className="text-primary-600 font-medium hover:text-primary-700">
              Return to Dashboard
            </button>
          </motion.div>)}
      </motion.div>
    </div>);
}

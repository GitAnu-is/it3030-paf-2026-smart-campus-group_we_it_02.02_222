import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { getResources, createBooking, checkBookingConflict } from '../lib/api';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Users, Building2, CheckCircle, AlertCircle, } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export function NewBooking() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preselectedResourceId = searchParams.get('resourceId');
    const [step, setStep] = useState(1);
    const [resources, setResources] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [conflictError, setConflictError] = useState(null);
    // Form State
    const [selectedResource, setSelectedResource] = useState(null);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [purpose, setPurpose] = useState('');
    const [attendees, setAttendees] = useState('');
    useEffect(() => {
        const fetchResources = async () => {
            try {
                const data = await getResources({
                    status: 'ACTIVE',
                });
                setResources(data);
                if (preselectedResourceId) {
                    const resource = data.find((r) => r.id === preselectedResourceId);
                    if (resource) {
                        setSelectedResource(resource);
                        setStep(2);
                    }
                }
            }
            catch (error) {
                console.error('Failed to fetch resources', error);
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchResources();
    }, [preselectedResourceId]);
    // Check for conflicts when date/time changes
    useEffect(() => {
        const checkConflict = async () => {
            if (selectedResource && date && startTime && endTime) {
                if (startTime >= endTime) {
                    setConflictError('End time must be after start time.');
                    return;
                }
                try {
                    const hasConflict = await checkBookingConflict(selectedResource.id, date, startTime, endTime);
                    if (hasConflict) {
                        setConflictError('This time slot is already booked. Please select another time.');
                    }
                    else {
                        setConflictError(null);
                    }
                }
                catch (error) {
                    console.error('Conflict check failed', error);
                }
            }
            else {
                setConflictError(null);
            }
        };
        const timeoutId = setTimeout(checkConflict, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [selectedResource, date, startTime, endTime]);
    const handleNext = () => {
        if (step === 1 && !selectedResource)
            return;
        if (step === 2 && (!date || !startTime || !endTime || conflictError))
            return;
        if (step === 3 && (!purpose || !attendees))
            return;
        setStep((s) => s + 1);
    };
    const handleBack = () => {
        setStep((s) => s - 1);
    };
    const handleSubmit = async () => {
        if (!user || !selectedResource)
            return;
        setIsSubmitting(true);
        try {
            await createBooking({
                resourceId: selectedResource.id,
                userId: user.id,
                date,
                startTime,
                endTime,
                purpose,
                attendees: parseInt(attendees, 10),
            });
            navigate('/bookings');
        }
        catch (error) {
            setConflictError(error.message || 'Failed to create booking');
            setStep(2); // Go back to time selection
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading)
        return <LoadingSpinner fullPage/>;
    const steps = [
        {
            number: 1,
            title: 'Resource',
        },
        {
            number: 2,
            title: 'Date & Time',
        },
        {
            number: 3,
            title: 'Details',
        },
        {
            number: 4,
            title: 'Review',
        },
    ];
    return (<div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">New Booking</h1>
        <button onClick={() => navigate('/bookings')} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
          Cancel
        </button>
      </div>

      {/* Step Indicator */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-slate-200 z-0"/>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-primary-500 z-0 transition-all duration-300" style={{
            width: `${((step - 1) / 3) * 100}%`,
        }}/>

          {steps.map((s) => (<div key={s.number} className="relative z-10 flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${step > s.number ? 'bg-primary-500 text-white' : step === s.number ? 'bg-primary-600 text-white ring-4 ring-primary-100' : 'bg-white text-slate-400 border-2 border-slate-200'}`}>
                {step > s.number ? (<CheckCircle className="w-5 h-5"/>) : (s.number)}
              </div>
              <span className={`absolute top-10 text-xs font-medium whitespace-nowrap ${step >= s.number ? 'text-slate-900' : 'text-slate-400'}`}>
                {s.title}
              </span>
            </div>))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col mt-8">
        <div className="p-6 md:p-8 flex-1">
          <AnimatePresence mode="wait">
            {/* Step 1: Resource */}
            {step === 1 && (<motion.div key="step1" initial={{
                opacity: 0,
                x: 20,
            }} animate={{
                opacity: 1,
                x: 0,
            }} exit={{
                opacity: 0,
                x: -20,
            }} className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Select a Resource
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {resources.map((resource) => (<div key={resource.id} onClick={() => setSelectedResource(resource)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedResource?.id === resource.id ? 'border-primary-500 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-slate-900">
                            {resource.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {resource.type.replace('_', ' ')}
                          </p>
                        </div>
                        <Building2 className={`w-5 h-5 ${selectedResource?.id === resource.id ? 'text-primary-500' : 'text-slate-400'}`}/>
                      </div>
                      <div className="mt-4 flex items-center text-xs text-slate-600 space-x-3">
                        <span className="flex items-center">
                          <Users className="w-3 h-3 mr-1"/> {resource.capacity}
                        </span>
                        <span className="truncate">{resource.location}</span>
                      </div>
                    </div>))}
                </div>
              </motion.div>)}

            {/* Step 2: Date & Time */}
            {step === 2 && (<motion.div key="step2" initial={{
                opacity: 0,
                x: 20,
            }} animate={{
                opacity: 1,
                x: 0,
            }} exit={{
                opacity: 0,
                x: -20,
            }} className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  When do you need it?
                </h2>

                {selectedResource && (<div className="p-4 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {selectedResource.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Available: {selectedResource.availabilityWindows}
                      </p>
                    </div>
                    <button onClick={() => setStep(1)} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                      Change
                    </button>
                  </div>)}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Date
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"/>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Start Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"/>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        End Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"/>
                      </div>
                    </div>
                  </div>
                </div>

                {conflictError && (<motion.div initial={{
                    opacity: 0,
                    y: -10,
                }} animate={{
                    opacity: 1,
                    y: 0,
                }} className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-500 mr-3 shrink-0 mt-0.5"/>
                    <p className="text-sm text-red-700">{conflictError}</p>
                  </motion.div>)}
              </motion.div>)}

            {/* Step 3: Details */}
            {step === 3 && (<motion.div key="step3" initial={{
                opacity: 0,
                x: 20,
            }} animate={{
                opacity: 1,
                x: 0,
            }} exit={{
                opacity: 0,
                x: -20,
            }} className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Booking Details
                </h2>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Purpose of Booking
                  </label>
                  <textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder="e.g., CS101 Midterm Exam, Study Group..." rows={3} className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"/>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Expected Attendees
                  </label>
                  <div className="relative max-w-xs">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"/>
                    <input type="number" min="1" max={selectedResource?.capacity} value={attendees} onChange={(e) => setAttendees(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"/>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Maximum capacity: {selectedResource?.capacity}
                  </p>
                </div>
              </motion.div>)}

            {/* Step 4: Review */}
            {step === 4 && (<motion.div key="step4" initial={{
                opacity: 0,
                x: 20,
            }} animate={{
                opacity: 1,
                x: 0,
            }} exit={{
                opacity: 0,
                x: -20,
            }} className="space-y-6">
                <h2 className="text-lg font-semibold text-slate-900">
                  Review & Submit
                </h2>

                <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                      Resource
                    </h3>
                    <p className="text-lg font-medium text-slate-900">
                      {selectedResource?.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {selectedResource?.location}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                        Date & Time
                      </h3>
                      <p className="text-slate-900 font-medium">{date}</p>
                      <p className="text-sm text-slate-600">
                        {startTime} - {endTime}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">
                        Details
                      </h3>
                      <p className="text-slate-900 font-medium">
                        {attendees} Attendees
                      </p>
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {purpose}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-500 mr-3 shrink-0 mt-0.5"/>
                  <p className="text-sm text-blue-800">
                    Your booking request will be sent to an administrator for
                    approval. You will receive a notification once it is
                    reviewed.
                  </p>
                </div>
              </motion.div>)}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 flex items-center justify-between mt-auto">
          <button onClick={handleBack} disabled={step === 1 || isSubmitting} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2"/> Back
          </button>

          {step < 4 ? (<button onClick={handleNext} disabled={(step === 1 && !selectedResource) ||
                (step === 2 &&
                    (!date || !startTime || !endTime || !!conflictError)) ||
                (step === 3 && (!purpose || !attendees))} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors shadow-sm">
              Next <ArrowRight className="w-4 h-4 ml-2"/>
            </button>) : (<button onClick={handleSubmit} disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors shadow-sm">
              {isSubmitting ? (<LoadingSpinner size="sm" className="text-white mr-2"/>) : (<CheckCircle className="w-4 h-4 mr-2"/>)}
              Submit Request
            </button>)}
        </div>
      </div>
    </div>);
}

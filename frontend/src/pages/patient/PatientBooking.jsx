import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiCheckCircle, FiAlertCircle, FiChevronLeft } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import Button from '../../components/Button';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

export default function PatientBooking() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(true); 
  const [checkingIntake, setCheckingIntake] = useState(true);
  const [latestIntake, setLatestIntake] = useState(null);
  
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      checkIntakeStatus();
      fetchDoctors();
    }
  }, [token]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchSlots(selectedDoctor, selectedDate);
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const res = await fetch('/api/patients/doctors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setDoctors(data.data);
      } else {
        addToast(data.message || 'Failed to fetch doctors', 'error');
      }
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
      addToast('Network error while fetching doctors', 'error');
    }
  };

  const checkIntakeStatus = async () => {
    try {
      const response = await fetch('/api/patients/intake-status', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        setIntakeComplete(data.data.completed);
        if (data.data.completed) {
          fetchIntakeHistory();
        }
      }
    } catch (err) {
      console.error('Failed to check intake status:', err);
    } finally {
      setCheckingIntake(false);
    }
  };

  const fetchIntakeHistory = async () => {
    try {
      const response = await fetch('/api/patients/intake-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success' && data.data.length > 0) {
        setLatestIntake(data.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch intake history:', err);
    }
  };

  const fetchSlots = async (docId, date) => {
    setFetchingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    try {
      const response = await fetch(`/api/slots?doctor_id=${docId}&date=${date}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setAvailableSlots(data);
    } catch (err) {
      console.error('Failed to fetch slots:', err);
      addToast('Error fetching availability', 'error');
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/slots/${selectedSlot.id}/book`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ patient_id: user?.id })
      });
      if (!response.ok) throw new Error('Booking failed');

      addToast(`Appointment scheduled for ${selectedDate} at ${selectedSlot.start_time}`, 'success');
      setTimeout(() => navigate('/patient-dashboard'), 1500);
    } catch (err) {
      addToast('Booking failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 relative">
      <div className="max-w-4xl mx-auto relative z-10 w-full pb-20">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-10 text-center">
          <button
            onClick={() => navigate('/patient-dashboard')}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white border border-surface-200 text-surface-400 hover:text-primary-600 hover:border-primary-200 transition-all flex items-center shadow-sm group"
          >
            <FiChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <h1 className="text-3xl font-black text-surface-900 font-display uppercase tracking-tight">
            Schedule <span className="gradient-text">Appointment</span>
          </h1>
        </motion.div>

        {!checkingIntake && !intakeComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 p-6 bg-amber-50 rounded-3xl border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
                <FiAlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-900 uppercase tracking-tight">Clinical Intake Required</h4>
                <p className="text-[11px] text-amber-700 font-medium">Please complete your digital health profile before scheduling a session.</p>
              </div>
            </div>
            <Button
              variant="primary"
              className="bg-amber-600 hover:bg-amber-700 border-amber-600 w-full sm:w-auto"
              size="sm"
              onClick={() => navigate('/patient-form')}
            >
              Finish Profile Now
            </Button>
          </motion.div>
        )}

        <div className="bg-white rounded-[2rem] border border-surface-200 shadow-premium p-6 sm:p-10 space-y-10">

          {/* Step 1: Select Provider & Date */}
          <div className="grid md:grid-cols-2 gap-8 pb-10 border-b border-surface-100">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-3 flex items-center gap-2">
                <FaStethoscope className="text-primary-500" /> 1. Select Provider
              </label>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {doctors.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctor(doc.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center gap-4
                          ${selectedDoctor === doc.id ? 'border-primary-500 bg-primary-50/50 shadow-md shadow-primary-500/10' : 'border-surface-200 hover:border-surface-300 bg-surface-50'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedDoctor === doc.id ? 'bg-primary-600 text-white' : 'bg-surface-200 text-surface-500'}`}>
                      {doc.User?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-surface-900 leading-none">{doc.User?.name}</p>
                      <p className="text-[9px] font-bold text-surface-500 uppercase tracking-widest">{doc.specialization}</p>
                    </div>
                    {selectedDoctor === doc.id && <FiCheckCircle className="ml-auto w-5 h-5 text-primary-600" />}
                  </div>
                ))}
                {doctors.length === 0 && <p className="text-xs text-surface-400 italic">No providers available.</p>}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-3 flex items-center gap-2">
                <FiCalendar className="text-primary-500" /> 2. Target Date
              </label>
              <div className="p-1">
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-surface-50 border border-surface-200 rounded-2xl px-5 py-4 text-sm font-bold focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 transition-all text-surface-700 uppercase tracking-wide"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Available Slots */}
          <div className="min-h-[200px]">
            <label className="block text-[10px] font-black uppercase tracking-widest text-surface-400 mb-6 flex items-center gap-2">
              <FiClock className="text-primary-500" /> 3. Secure Time Slot
            </label>

            {!selectedDoctor || !selectedDate ? (
              <div className="flex flex-col items-center justify-center py-10 bg-surface-50 rounded-2xl border border-dashed border-surface-200">
                <FiAlertCircle className="w-6 h-6 text-surface-300 mb-2" />
                <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">Select a provider and date first</p>
              </div>
            ) : fetchingSlots ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : availableSlots.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 bg-red-50/50 rounded-2xl border border-red-100">
                <FiAlertCircle className="w-6 h-6 text-red-300 mb-2" />
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">No available slots for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-3 py-3 rounded-xl border text-xs font-black transition-all cursor-pointer shadow-sm
                       ${selectedSlot?.id === slot.id
                        ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/20 scale-105'
                        : 'bg-white border-surface-200 text-surface-900 hover:border-primary-300 hover:text-primary-600'
                      }`}
                  >
                    {slot.start_time.substring(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Checkout */}
          <AnimatePresence>
            {selectedSlot && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-8 border-t border-surface-100 bg-primary-50/30 -mx-6 -mb-6 sm:-mx-10 sm:-mb-10 p-6 sm:p-10 rounded-b-[2rem]">
                  {latestIntake && (
                    <div className="mb-8 p-6 bg-white rounded-2xl border border-primary-100 shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Intake History Summary</h4>
                        <span className="text-[9px] text-surface-400 font-bold">{new Date(latestIntake.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] text-surface-400 font-black uppercase tracking-widest mb-1">Chief Complaint</p>
                          <p className="text-xs font-bold text-surface-700 line-clamp-2">{latestIntake.symptoms}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-surface-400 font-black uppercase tracking-widest mb-1">Status</p>
                          <div className="flex items-center gap-1 text-emerald-600">
                            <FiCheckCircle className="w-3 h-3" />
                            <span className="text-xs font-bold">PROFILE COMPLETE</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary-600/60 mb-1">Confirmation</p>
                      <p className="text-sm font-black text-surface-900">
                        {selectedDate} at {selectedSlot.start_time.substring(0, 5)}
                      </p>
                    </div>
                    <Button
                      onClick={handleBook}
                      loading={loading}
                      disabled={!intakeComplete}
                      size="lg"
                      variant="primary"
                      className="w-full sm:w-auto px-10 shadow-float"
                    >
                      {intakeComplete ? 'Confirm Booking' : 'Profile Required'}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiClock, FiCheckCircle, FiAlertCircle, FiChevronLeft, FiChevronRight, FiHeart
} from 'react-icons/fi';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

const categoryIcons = {
  General: '🩺', Cardiology: 'FiHeart', Dermatology: '🧴', Pediatrics: '👶',
  Orthopedics: '🦴', Neurology: '🧠', Gynecology: '🌸', Psychiatry: '🧘',
  ENT: '👂', Dentistry: '🦷',
};

export default function PatientBooking() {
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [intakeComplete, setIntakeComplete] = useState(true);
  const [checkingIntake, setCheckingIntake] = useState(true);

  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, token } = useAuth();

  useEffect(() => {
    if (token) {
      checkIntakeStatus();
      fetchCategories();
    }
  }, [token]);

  useEffect(() => {
    if (selectedCategory) fetchDoctors(selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) fetchSlots(selectedDoctor, selectedDate);
  }, [selectedDoctor, selectedDate]);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/patients/doctor-categories', { headers });
      const data = await res.json();
      if (data.status === 'success') setCategories(data.data);
    } catch {
      addToast('Failed to load doctor categories', 'error');
    }
  };

  const fetchDoctors = async (category) => {
    try {
      const res = await fetch(`/api/patients/doctors?specialization=${encodeURIComponent(category)}`, { headers });
      const data = await res.json();
      if (data.status === 'success') setDoctors(data.data);
    } catch {
      addToast('Failed to load doctors', 'error');
    }
  };

  const checkIntakeStatus = async () => {
    try {
      const res = await fetch('/api/patients/intake-status', { headers });
      const data = await res.json();
      if (data.status === 'success') setIntakeComplete(data.data.completed);
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingIntake(false);
    }
  };

  const fetchSlots = async (docId, date) => {
    setFetchingSlots(true);
    setAvailableSlots([]);
    setSelectedSlot(null);
    try {
      const res = await fetch(`/api/slots?doctor_id=${docId}&date=${date}`, { headers });
      const data = await res.json();
      setAvailableSlots(Array.isArray(data) ? data : []);
    } catch {
      addToast('Error fetching availability', 'error');
    } finally {
      setFetchingSlots(false);
    }
  };

  const handleBook = async () => {
    if (!selectedSlot) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/slots/${selectedSlot.id}/book`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify({ patient_id: user?.id }),
      });
      if (!res.ok) throw new Error('Booking failed');
      addToast(`Appointment booked for ${selectedDate} at ${selectedSlot.start_time?.substring(0, 5)}`, 'success');
      setTimeout(() => navigate('/patient-dashboard'), 1500);
    } catch {
      addToast('Booking failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectCategory = (cat) => {
    setSelectedCategory(cat);
    setSelectedDoctor('');
    setSelectedDate('');
    setSelectedSlot(null);
    setStep(2);
  };

  const selectDoctor = (id) => {
    setSelectedDoctor(id);
    setSelectedDate('');
    setSelectedSlot(null);
    setStep(3);
  };

  return (
    <div className="w-auto mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => (step > 1 ? setStep(step - 1) : navigate('/patient-dashboard'))}
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
        >
          <FiChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Book Appointment</h1>
          <p className="text-sm text-gray-500">Step {step} of 3</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2">
        {['Category', 'Doctor', 'Schedule'].map((label, i) => (
          <div
            key={label}
            className={`flex-1 h-1 rounded-full ${step > i ? 'bg-blue-500' : 'bg-gray-200'}`}
          />
        ))}
      </div>

      {!checkingIntake && !intakeComplete && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Complete your health profile first</p>
          </div>
          <button onClick={() => navigate('/patient-form')} className="text-sm font-medium text-blue-600">
            Complete →
          </button>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
        {/* Step 1: Category */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-sm font-semibold text-gray-800 mb-4">Choose doctor category</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => selectCategory(cat.name)}
                  className={`p-4 rounded-xl border text-center transition-colors hover:border-blue-300 hover:bg-blue-50/50 ${
                    selectedCategory === cat.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <span className="text-2xl">{categoryIcons[cat.name] || '🩺'}</span>
                  <p className="text-sm font-medium text-gray-800 mt-2">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.count} doctor{cat.count !== 1 ? 's' : ''}</p>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Doctor */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Select a doctor</h2>
            <p className="text-xs text-gray-500 mb-4">Category: {selectedCategory}</p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {doctors.length > 0 ? doctors.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => selectDoctor(doc.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    selectedDoctor === doc.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-600">
                    {doc.User?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800">{doc.User?.name}</p>
                    <p className="text-xs text-gray-500">{doc.specialization} · {doc.experience || 0} yrs exp</p>
                  </div>
                  {selectedDoctor === doc.id && <FiCheckCircle className="w-5 h-5 text-blue-500" />}
                  {!selectedDoctor && <FiChevronRight className="w-4 h-4 text-gray-300" />}
                </button>
              )) : (
                <p className="text-sm text-gray-400 text-center py-8">No doctors in this category. Try another.</p>
              )}
            </div>
          </motion.div>
        )}

        {/* Step 3: Date & slots */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <FiCalendar className="w-4 h-4 text-gray-400" /> Select date
              </label>
              <input
                type="date"
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-3">
                <FiClock className="w-4 h-4 text-gray-400" /> Available time slots
              </label>
              {!selectedDate ? (
                <p className="text-sm text-gray-400 text-center py-6">Pick a date to see available slots</p>
              ) : fetchingSlots ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : availableSlots.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No slots available for this date</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        selectedSlot?.id === slot.id
                          ? 'bg-blue-500 border-blue-500 text-white'
                          : 'border-gray-200 text-gray-700 hover:border-blue-300'
                      }`}
                    >
                      {slot.start_time?.substring(0, 5)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedSlot && (
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-gray-800">{selectedDate}</span> at{' '}
                  <span className="font-medium text-gray-800">{selectedSlot.start_time?.substring(0, 5)}</span>
                </p>
                <button
                  onClick={handleBook}
                  disabled={loading || !intakeComplete}
                  className="w-full sm:w-auto px-6 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {loading ? 'Booking...' : intakeComplete ? 'Confirm Booking' : 'Complete profile first'}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

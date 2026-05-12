import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiClock, FiFileText, FiSearch, FiChevronDown, FiChevronUp, FiCalendar,
  FiUser, FiMail, FiPhone, FiChevronLeft, FiChevronRight, FiFilter,
} from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import Modal from '../../components/Modal';

const statusStyle = {
  COMPLETED: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-100', label: 'Completed' },
  BOOKED: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-100', label: 'Booked' },
  IN_PROGRESS: { bg: 'bg-primary-50', text: 'text-primary-700', border: 'border-primary-100', label: 'In Progress' },
  CANCELLED: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-100', label: 'Cancelled' },
  AVAILABLE: { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-200', label: 'Available' },
};

export default function DoctorScheduleHistory() {
  const { token } = useAuth();
  const { addToast } = useToast();
  
  const [viewMode, setViewMode] = useState('PAST'); // 'PAST' or 'FUTURE'
  const [loading, setLoading] = useState(true);
  const [calendarOverview, setCalendarOverview] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [dateSlots, setDateSlots] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [profile, setProfile] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Fetch Profile on load to get join date
  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/doctor/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') setProfile(data.data);
    } catch (error) {
      console.error('Failed to fetch profile');
    }
  };

  // Fetch calendar overview whenever month changes or viewMode changes
  useEffect(() => {
    if (token) fetchCalendarOverview();
  }, [token, currentMonth, viewMode]);

  // Fetch slots whenever selectedDate changes
  useEffect(() => {
    if (token) fetchSlotsByDate();
  }, [token, selectedDate]);

  const fetchCalendarOverview = async () => {
    try {
      const start = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toLocaleDateString('en-CA');
      const end = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toLocaleDateString('en-CA');
      
      const res = await fetch(`/api/doctor/calendar-overview?start=${start}&end=${end}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') setCalendarOverview(data.data);
    } catch (error) {
      addToast('Failed to load calendar data', 'error');
    }
  };

  const fetchSlotsByDate = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/doctor/slots-by-date?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') setDateSlots(data.data);
    } catch (error) {
      addToast('Failed to load slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderMedicalHistory = (historyStr) => {
    try {
      const data = JSON.parse(historyStr);
      return (
        <div className="grid grid-cols-1 gap-2 mt-2">
          {data.diseases?.length > 0 && (
            <div className="p-2 bg-primary-50 rounded-lg border border-primary-100">
              <p className="text-[8px] font-black text-primary-600 uppercase mb-1">Conditions</p>
              <p className="text-[10px] font-bold text-primary-800">{data.diseases.filter(d => d !== 'None').join(', ')}</p>
            </div>
          )}
          {data.allergies && data.allergies !== 'None' && (
            <div className="p-2 bg-rose-50 rounded-lg border border-rose-100">
              <p className="text-[8px] font-black text-rose-600 uppercase mb-1">Allergies</p>
              <p className="text-[10px] font-bold text-rose-800">{data.allergies}</p>
            </div>
          )}
        </div>
      );
    } catch (e) {
      return <p className="text-[10px] font-bold text-surface-700">{historyStr}</p>;
    }
  };

  // Calendar Helper
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));

  const calendarDays = [];
  const totalDays = daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
  const startDay = firstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

  for (let i = 0; i < startDay; i++) calendarDays.push(null);
  for (let i = 1; i <= totalDays; i++) calendarDays.push(i);

  const isToday = (day) => {
    const d = new Date();
    return d.getDate() === day && d.getMonth() === currentMonth.getMonth() && d.getFullYear() === currentMonth.getFullYear();
  };

  const isSelected = (day) => {
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString('en-CA');
    return d === selectedDate;
  };

  const isDisabled = (day) => {
    if (!day) return true;
    const d = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateStr = d.toLocaleDateString('en-CA');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (viewMode === 'PAST') {
      const joinDate = profile?.createdAt ? new Date(profile.createdAt) : new Date();
      joinDate.setHours(0, 0, 0, 0);
      
      // Disabled if:
      // 1. After today
      // 2. Before join date
      // 3. No records exist for that date
      if (d > today || d < joinDate) return true;
      return !calendarOverview[dateStr];
    }
    
    if (viewMode === 'FUTURE') {
      // Disabled if:
      // 1. Before today
      // 2. No slots created for that date
      if (d < today) return true;
      return !calendarOverview[dateStr];
    }
    
    return false;
  };

  return (
    <div className="flex min-h-screen bg-surface-50 font-sans">
      <Sidebar />
      <main className="flex-1 overflow-auto medical-grid">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <FiClock className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-black text-surface-900 font-display uppercase tracking-tight">Clinical <span className="gradient-text">Schedule</span></h1>
              </div>
              <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.2em] leading-none ml-13">Unified Patient & Consultation Tracking</p>
            </motion.div>

            {/* View Toggle */}
            <div className="flex p-1 bg-surface-100 rounded-2xl border border-surface-200">
              <button
                onClick={() => { setViewMode('PAST'); setSelectedDate(new Date().toLocaleDateString('en-CA')); }}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'PAST' ? 'bg-white text-primary-600 shadow-sm' : 'text-surface-400 hover:text-surface-600'}`}
              >
                Past History
              </button>
              <button
                onClick={() => { setViewMode('FUTURE'); setSelectedDate(new Date().toLocaleDateString('en-CA')); }}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${viewMode === 'FUTURE' ? 'bg-white text-amber-600 shadow-sm' : 'text-surface-400 hover:text-surface-600'}`}
              >
                Future History
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            {/* Calendar Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2.5rem] border border-surface-200 shadow-premium p-6 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />
                
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <h2 className="text-sm font-black uppercase tracking-widest text-surface-900">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </h2>
                  <div className="flex gap-1">
                    <button onClick={handlePrevMonth} className="p-2 hover:bg-surface-50 rounded-xl transition-colors text-surface-400 hover:text-primary-600">
                      <FiChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={handleNextMonth} className="p-2 hover:bg-surface-50 rounded-xl transition-colors text-surface-400 hover:text-primary-600">
                      <FiChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 mb-2 relative z-10">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-center text-[10px] font-black text-surface-300 uppercase py-2">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1 relative z-10">
                  {calendarDays.map((day, i) => {
                    if (!day) return <div key={`empty-${i}`} className="aspect-square" />;
                    
                    const dateStr = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toLocaleDateString('en-CA');
                    const info = calendarOverview[dateStr];
                    const disabled = isDisabled(day);
                    const selected = isSelected(day);

                    return (
                      <button
                        key={day}
                        disabled={disabled}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`aspect-square rounded-2xl flex flex-col items-center justify-center relative transition-all duration-300 ${
                          disabled ? 'opacity-20 cursor-not-allowed' : 
                          selected ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20' : 
                          'hover:bg-primary-50 text-surface-600'
                        }`}
                      >
                        <span className={`text-[11px] font-black ${selected ? 'text-white' : 'text-surface-900'}`}>{day}</span>
                        {info && info.total > 0 && !selected && (
                          <div className={`mt-1 text-[7px] font-black uppercase px-1 rounded ${info.booked > 0 ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                            {info.total} Slots
                          </div>
                        )}
                        {isToday(day) && !selected && (
                          <div className="absolute top-1 right-1 w-1 h-1 bg-primary-600 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Day Summary */}
              <div className="bg-primary-600 rounded-[2rem] p-6 text-white shadow-premium overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
                <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-80">Selected Day Insight</h3>
                <p className="text-2xl font-black mb-1">{new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                
                <div className="grid grid-cols-2 gap-4 mt-8">
                   <div>
                     <p className="text-xl font-black">{dateSlots.length}</p>
                     <p className="text-[8px] font-black uppercase opacity-60">Total Slots</p>
                   </div>
                   <div>
                     <p className="text-xl font-black text-amber-300">{dateSlots.filter(s => s.is_booked).length}</p>
                     <p className="text-[8px] font-black uppercase opacity-60">Booked</p>
                   </div>
                </div>
              </div>
            </div>

            {/* List Section */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-[2.5rem] border border-surface-200 shadow-premium overflow-hidden min-h-[600px]">
                <div className="px-8 py-6 border-b border-surface-100 bg-surface-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FiFilter className="text-primary-600" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-surface-900">Patient Engagements</h2>
                  </div>
                  <span className="text-[9px] font-black uppercase text-surface-400 tracking-widest">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-surface-50 rounded-3xl animate-pulse" />
                      ))}
                    </div>
                  ) : dateSlots.length > 0 ? (
                    <div className="space-y-4">
                      {dateSlots.map((slot) => {
                        const isBooked = slot.is_booked;
                        const isExpanded = expandedId === slot.id;
                        const stStyle = statusStyle[slot.status] || statusStyle.AVAILABLE;

                        return (
                          <div
                            key={slot.id}
                            className={`rounded-3xl border transition-all duration-300 overflow-hidden ${
                              isBooked ? 'bg-amber-50/30 border-amber-200 shadow-sm shadow-amber-100/50' : 'bg-white border-surface-100'
                            }`}
                          >
                            <div
                              className="p-5 flex items-center gap-4 cursor-pointer group"
                              onClick={() => isBooked && setExpandedId(isExpanded ? null : slot.id)}
                            >
                              <div className={`w-14 text-center shrink-0`}>
                                <p className="text-xs font-black text-surface-900 uppercase">{slot.start_time.substring(0, 5)}</p>
                                <p className="text-[8px] font-black text-surface-400 uppercase tracking-tighter">to {slot.end_time.substring(0, 5)}</p>
                              </div>

                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-105 ${
                                isBooked ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'
                              }`}>
                                {isBooked ? (slot.Patient?.User?.name?.split(' ').map(n => n[0]).join('') || 'P') : 'A'}
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-black uppercase tracking-tight truncate ${isBooked ? 'text-surface-900' : 'text-surface-400'}`}>
                                  {isBooked ? slot.Patient?.User?.name : 'Available Slot'}
                                </p>
                                <p className="text-[9px] font-bold text-surface-400 uppercase">
                                  {isBooked ? `${slot.Patient?.age}Y • ${slot.Patient?.gender}` : 'No patient booked yet'}
                                </p>
                              </div>

                              <div className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${stStyle.bg} ${stStyle.text} ${stStyle.border}`}>
                                {stStyle.label}
                              </div>

                              {isBooked && (
                                <div className="p-2 text-surface-300 group-hover:text-primary-600">
                                  {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                                </div>
                              )}
                            </div>

                            <AnimatePresence>
                              {isExpanded && isBooked && (
                                <motion.div
                                  initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-5 pb-6 pt-1 grid sm:grid-cols-2 gap-4 border-t border-amber-200/50 mt-1">
                                     <div className="p-4 bg-white/50 rounded-2xl border border-amber-100">
                                       <p className="text-[8px] font-black text-amber-600 uppercase mb-3">Clinical Profile</p>
                                       <div className="space-y-2">
                                          <div className="flex items-center gap-2">
                                            <FiPhone className="w-3 h-3 text-amber-500" />
                                            <span className="text-[10px] font-bold">{slot.Patient?.User?.phone}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <FiMail className="w-3 h-3 text-amber-500" />
                                            <span className="text-[10px] font-bold truncate">{slot.Patient?.User?.email}</span>
                                          </div>
                                       </div>
                                       <button 
                                         onClick={(e) => { e.stopPropagation(); setSelectedPatient(slot.Patient); }}
                                         className="w-full mt-4 py-2 bg-amber-500 text-white text-[9px] font-black uppercase rounded-xl shadow-md shadow-amber-500/20 hover:bg-amber-600 transition-all"
                                       >
                                         View Full Clinical History
                                       </button>
                                     </div>
                                     <div className="p-4 bg-white/50 rounded-2xl border border-amber-100">
                                       <p className="text-[8px] font-black text-amber-600 uppercase mb-3">Consultation Overview</p>
                                       {slot.Consultation?.Prescription ? (
                                         <div className="space-y-3">
                                           <div>
                                             <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1">Diagnosis</p>
                                             <p className="text-[11px] font-black text-surface-900 leading-tight uppercase">{slot.Consultation.Prescription.diagnosis}</p>
                                           </div>
                                           <div>
                                             <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1.5">Regimen</p>
                                             <div className="flex flex-wrap gap-1.5">
                                               {slot.Consultation.Prescription.medicines?.slice(0, 2).map((m, mi) => (
                                                 <span key={mi} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[8px] font-bold rounded-lg border border-emerald-100 uppercase">
                                                   {m.name}
                                                 </span>
                                               ))}
                                               {slot.Consultation.Prescription.medicines?.length > 2 && (
                                                 <span className="text-[8px] font-bold text-surface-400">+{slot.Consultation.Prescription.medicines.length - 2} more</span>
                                               )}
                                             </div>
                                           </div>
                                           <div className="flex items-center gap-2 mt-1">
                                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                              <p className="text-[8px] font-black text-emerald-600 uppercase">Verified Rx Issued</p>
                                           </div>
                                         </div>
                                       ) : (
                                         <div className="flex flex-col items-center justify-center h-full py-4 opacity-40">
                                            <FiFileText className="w-6 h-6 mb-2" />
                                            <p className="text-[9px] font-black uppercase">No Documentation</p>
                                         </div>
                                       )}
                                     </div>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-32 opacity-30 text-center">
                      <FiCalendar className="w-12 h-12 mb-4" />
                      <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Engagements Registered</p>
                      <p className="text-[9px] font-medium mt-1 uppercase tracking-widest">Select another date from the calendar</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* EHR Modal (Same as Dashboard) */}
      <Modal isOpen={!!selectedPatient} onClose={() => setSelectedPatient(null)} title="Clinical Patient Record" size="lg">
        {selectedPatient && (
          <div className="p-2">
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-primary-600 rounded-[1.5rem] flex items-center justify-center text-white text-2xl font-black shadow-xl">
                {selectedPatient.User?.name?.split(' ').map(n => n[0]).join('') || 'P'}
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-surface-900 font-display mb-1">{selectedPatient.User?.name}</h3>
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 bg-surface-100 rounded-lg text-[10px] font-black text-surface-600 uppercase tracking-widest">{selectedPatient.gender}</span>
                  <span className="px-2.5 py-1 bg-surface-100 rounded-lg text-[10px] font-black text-surface-600 uppercase tracking-widest">{selectedPatient.age} YEARS</span>
                </div>
              </div>
            </div>

            <div className="space-y-8">
               <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-surface-50 rounded-[1.5rem] border border-surface-100">
                    <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-2">Patient Contact</p>
                    <p className="text-sm font-bold text-surface-900 mb-0.5">{selectedPatient.User?.phone}</p>
                    <p className="text-[10px] text-primary-600 font-bold">{selectedPatient.User?.email}</p>
                  </div>
                  <div className="p-5 bg-surface-50 rounded-[1.5rem] border border-surface-100">
                    <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-2">Operational Insight</p>
                    <p className="text-sm font-bold text-surface-900 mb-0.5">Clinical History</p>
                    <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest">
                      {selectedPatient.MedicalRecords?.length || 0} Records Found
                    </p>
                  </div>
               </div>

               <div>
                 <div className="flex items-center justify-between mb-5">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Clinical History Timeline</p>
                    <div className="h-[1px] flex-1 bg-surface-100 mx-4" />
                 </div>
                 
                 <div className="space-y-6 max-h-[400px] overflow-auto pr-2">
                    {/* Consultations */}
                    {selectedPatient.Consultations?.map((con, i) => (
                      <div key={`con-${i}`} className="bg-white border border-primary-100 rounded-[2rem] shadow-sm overflow-hidden group hover:border-primary-300 transition-all duration-300">
                        <div className="px-6 py-4 bg-primary-50/30 border-b border-primary-100 flex items-center justify-between">
                           <span className="text-[10px] font-black text-surface-900 uppercase tracking-widest flex items-center gap-2">
                             <FiCalendar className="text-primary-600" /> {new Date(con.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </span>
                           <span className="text-[9px] font-black text-emerald-600 uppercase px-3 py-1 bg-emerald-100/50 rounded-lg tracking-tighter">Clinical Prescription</span>
                        </div>
                        <div className="p-6">
                           {con.Prescription ? (
                             <div className="space-y-4">
                               <div>
                                 <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1.5">Diagnosis</p>
                                 <p className="text-sm font-black text-surface-900 uppercase">{con.Prescription.diagnosis}</p>
                               </div>
                               <div>
                                 <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-2">Medications</p>
                                 <div className="flex flex-wrap gap-2">
                                   {con.Prescription.medicines?.map((m, mi) => (
                                     <div key={mi} className="px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-xl text-[10px] font-bold text-surface-700">
                                       {m.name} • {m.dosage} ({m.duration})
                                     </div>
                                   ))}
                                 </div>
                               </div>
                             </div>
                           ) : (
                             <p className="text-[10px] text-surface-400 font-bold italic">No prescription issued.</p>
                           )}
                        </div>
                      </div>
                    ))}

                    {/* Medical Records */}
                    {selectedPatient.MedicalRecords?.map((record, i) => (
                      <div key={`rec-${i}`} className="bg-white border border-surface-200 rounded-[2rem] shadow-sm overflow-hidden group hover:border-primary-200 transition-all duration-300">
                        <div className="px-6 py-4 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
                           <span className="text-[10px] font-black text-surface-900 uppercase tracking-widest flex items-center gap-2">
                             <FiCalendar className="text-primary-600" /> {new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </span>
                           <span className="text-[9px] font-black text-primary-50 uppercase px-3 py-1 bg-primary-100/50 rounded-lg tracking-tighter">Verified Entry</span>
                        </div>
                        <div className="p-6 space-y-4">
                           <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest">Chief Complaint</p>
                           <p className="text-sm font-bold text-surface-800 leading-relaxed italic">"{record.symptoms}"</p>
                           <div>
                             <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                               <FiFileText className="text-primary-500" /> Medical History
                             </p>
                             {renderMedicalHistory(record.history)}
                           </div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

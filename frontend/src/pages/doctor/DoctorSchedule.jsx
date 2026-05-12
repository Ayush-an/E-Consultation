import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiCalendar, FiClock, FiPlus, FiTrash2, FiCheck, FiX,
  FiChevronLeft, FiChevronRight, FiInfo, FiLayout
} from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export default function DoctorSchedule() {
  const { token } = useAuth();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [slots, setSlots] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Generation Form State
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '17:00',
    interval: 30
  });

  const fetchSlots = async (date) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/doctor/slots?date=${date}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSlots(data.data);
      }
    } catch (error) {
      addToast('Failed to load slots', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSlots(selectedDate);
    }
  }, [token, selectedDate]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/doctor/slots/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.status === 'success') {
        addToast(`Successfully generated ${data.count} slots`, 'success');
        if (formData.date === selectedDate) {
          fetchSlots(selectedDate);
        } else {
          setSelectedDate(formData.date);
        }
      } else {
        addToast(data.message, 'error');
      }
    } catch (error) {
      addToast('Failed to generate slots', 'error');
    }
  };

  const deleteSlot = async (id) => {
    try {
      const res = await fetch(`/api/doctor/slots/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        addToast('Slot deleted', 'success');
        setSlots(slots.filter(s => s.id !== id));
      } else {
        addToast(data.message, 'error');
      }
    } catch (error) {
      addToast('Failed to delete slot', 'error');
    }
  };

  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar />
      <main className="flex-1 overflow-auto medical-grid">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                  <FiLayout className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-surface-900 font-display">Manage <span className="gradient-text">Schedule</span></h1>
                  <p className="text-[10px] text-surface-400 font-black uppercase tracking-widest">Generate and organize your daily consultation slots</p>
                </div>
              </div>
            </motion.div>

            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-surface-200 shadow-sm">
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-2 hover:bg-surface-50 rounded-lg text-surface-400 hover:text-primary-600 transition-all"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <div className="px-4 text-center">
                <p className="text-xs font-black text-surface-900 uppercase">
                  {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-[9px] font-bold text-primary-600 uppercase tracking-widest">Active View</p>
              </div>
              <button 
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d.toISOString().split('T')[0]);
                }}
                className="p-2 hover:bg-surface-50 rounded-lg text-surface-400 hover:text-primary-600 transition-all"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Slot Generation Form */}
            <div className="lg:col-span-1">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-surface-200 shadow-premium p-6 sticky top-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center border border-amber-100">
                    <FiPlus className="w-4 h-4 text-amber-600" />
                  </div>
                  <h3 className="text-sm font-black text-surface-900 uppercase tracking-widest">Generate Slots</h3>
                </div>

                <form onSubmit={handleGenerate} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-2">Target Date</label>
                    <div className="relative">
                      <FiCalendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                      <input 
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-2">Start Time</label>
                      <div className="relative">
                        <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                        <input 
                          type="time"
                          value={formData.start_time}
                          onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-2">End Time</label>
                      <div className="relative">
                        <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 w-4 h-4" />
                        <input 
                          type="time"
                          value={formData.end_time}
                          onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                          className="w-full pl-10 pr-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-2">Slot Duration (Min)</label>
                    <select 
                      value={formData.interval}
                      onChange={(e) => setFormData({...formData, interval: parseInt(e.target.value)})}
                      className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="20">20 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <Button type="submit" variant="primary" className="w-full py-4 shadow-xl shadow-primary-500/20" icon={FiLayout}>
                      GENERATE SESSIONS
                    </Button>
                    <p className="text-[9px] text-surface-400 mt-3 text-center font-medium">
                      This will create available time slots for the selected period.
                    </p>
                  </div>
                </form>
              </motion.div>
            </div>

            {/* Slots List */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl border border-surface-200 shadow-premium overflow-hidden">
                <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
                  <div className="flex items-center gap-2">
                    <FiClock className="text-primary-600" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-surface-900">
                      Slots for {new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    </h2>
                  </div>
                  <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-lg text-[9px] font-black uppercase">{slots.length} Total</span>
                </div>

                <div className="p-6">
                  {loading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 bg-surface-50 rounded-2xl animate-pulse" />
                      ))}
                    </div>
                  ) : slots.length > 0 ? (
                    <div className="grid sm:grid-cols-2 gap-4">
                      <AnimatePresence mode="popLayout">
                        {slots.map((slot) => (
                          <motion.div
                            key={slot.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`p-4 rounded-2xl border transition-all duration-300 ${
                              slot.is_booked 
                              ? 'bg-amber-50/50 border-amber-200' 
                              : 'bg-white border-surface-200 hover:border-primary-300 hover:shadow-md'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                  slot.is_booked ? 'bg-amber-100 text-amber-600' : 'bg-primary-50 text-primary-600'
                                }`}>
                                  <FiClock className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                  <p className="text-xs font-black text-surface-900">
                                    {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                  </p>
                                  <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest">
                                    {slot.is_booked ? `Booked by ${slot.Patient?.User?.name}` : 'Available'}
                                  </p>
                                </div>
                              </div>
                              {!slot.is_booked && (
                                <button 
                                  onClick={() => deleteSlot(slot.id)}
                                  className="p-2 text-surface-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </button>
                              )}
                              {slot.is_booked && (
                                <div className="p-2 text-amber-500">
                                  <FiCheck className="w-4 h-4" />
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="py-20 text-center border-2 border-dashed border-surface-200 rounded-3xl">
                      <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiCalendar className="w-7 h-7 text-surface-300" />
                      </div>
                      <h4 className="text-sm font-black text-surface-900 uppercase mb-1">No Slots Defined</h4>
                      <p className="text-[10px] text-surface-400 font-medium uppercase tracking-widest">Use the form on the left to generate slots for this day.</p>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-surface-50 border-t border-surface-100 flex items-center gap-3">
                  <FiInfo className="text-primary-500 w-4 h-4 shrink-0" />
                  <p className="text-[10px] text-surface-500 font-medium">
                    Note: Booked slots cannot be deleted. You can only manage available slots to prevent session conflicts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

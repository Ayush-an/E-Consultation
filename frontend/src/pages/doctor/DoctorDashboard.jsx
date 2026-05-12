import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUsers, FiMessageSquare, FiFileText, FiClock,
  FiEye, FiVideo, FiTrendingUp, FiCalendar,
} from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { Skeleton } from '../../components/Skeleton';

const statusColors = {
  AVAILABLE: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500', label: 'Open' },
  BOOKED: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500', label: 'Waiting' },
  IN_PROGRESS: { bg: 'bg-primary-50', text: 'text-primary-700', dot: 'bg-primary-500', label: 'Active' },
  COMPLETED: { bg: 'bg-secondary-50', text: 'text-secondary-700', dot: 'bg-secondary-500', label: 'Done' },
};

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [queue, setQueue] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      // Stats
      const statsRes = await fetch('/api/doctor/stats', { headers });
      const statsData = await statsRes.json();
      if (statsData.status === 'success') setStats(statsData.data);

      // Profile
      const profileRes = await fetch('/api/doctor/profile', { headers });
      const profileData = await profileRes.json();
      if (profileData.status === 'success') setProfile(profileData.data);

      // Queue (Upcoming booked slots)
      const queueRes = await fetch('/api/doctor/queue', { headers });
      const queueData = await queueRes.json();
      if (queueData.status === 'success') setQueue(queueData.data);

      // Active Consultations
      const consultationsRes = await fetch('/api/doctor/consultations', { headers });
      const consultationsData = await consultationsRes.json();
      if (consultationsData.status === 'success') {
        setConsultations(consultationsData.data.filter(c => c.status === 'ACTIVE'));
      }

    } catch (error) {
      addToast('Failed to fetch dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      console.log('Fetching data for user:', user);
      fetchData();
      const interval = setInterval(fetchData, 30000); // Refresh every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  const startConsultation = async (slotId) => {
    try {
      const res = await fetch('/api/doctor/queue/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ slotId })
      });
      const data = await res.json();
      if (data.status === 'success') {
        navigate('/consultation', { state: { consultation: data.data } });
      } else {
        addToast(data.message, 'error');
      }
    } catch (error) {
      addToast('Failed to start session', 'error');
    }
  };

  const viewPatientDetails = async (patientId) => {
    try {
      const res = await fetch(`/api/doctor/patients/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') {
        setSelectedPatient(data.data);
      } else {
        addToast(data.message, 'error');
      }
    } catch (error) {
      addToast('Failed to fetch patient records', 'error');
    }
  };

  const renderMedicalHistory = (historyStr) => {
    try {
      const data = JSON.parse(historyStr);
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
          {data.diseases?.length > 0 && (
            <div className="p-3 bg-primary-50/50 rounded-xl border border-primary-100/50">
              <p className="text-[8px] font-black text-primary-600 uppercase tracking-widest mb-1">Pre-existing Conditions</p>
              <div className="flex flex-wrap gap-1">
                {data.diseases.filter(d => d !== 'None').map(d => (
                  <span key={d} className="px-2 py-0.5 bg-white border border-primary-200 text-primary-700 text-[9px] font-bold rounded-md">{d}</span>
                ))}
              </div>
            </div>
          )}
          {data.allergies && data.allergies !== 'None' && (
            <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100/50">
              <p className="text-[8px] font-black text-rose-600 uppercase tracking-widest mb-1">Known Allergies</p>
              <p className="text-[10px] font-bold text-rose-700">{data.allergies}</p>
            </div>
          )}
          {data.medications && data.medications !== 'None' && (
            <div className="p-3 bg-secondary-50/50 rounded-xl border border-secondary-100/50">
              <p className="text-[8px] font-black text-secondary-600 uppercase tracking-widest mb-1">Current Medications</p>
              <p className="text-[10px] font-bold text-secondary-700">{data.medications}</p>
            </div>
          )}
          {data.familyHistory && data.familyHistory !== 'None' && (
            <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-100/50">
              <p className="text-[8px] font-black text-amber-600 uppercase tracking-widest mb-1">Family History</p>
              <p className="text-[10px] font-bold text-amber-700">{data.familyHistory}</p>
            </div>
          )}
        </div>
      );
    } catch (e) {
      return <p className="text-[10px] font-bold text-surface-700">{historyStr}</p>;
    }
  };

  const dashboardStats = [
    { label: 'Total Patients', value: stats?.totalPatients || 0, icon: FiUsers, color: 'bg-primary-600', shadow: 'shadow-primary-500/20' },
    { label: 'Queue List', value: queue.length, icon: FiClock, color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
    { label: 'Live Sessions', value: consultations.length, icon: FiVideo, color: 'bg-secondary-600', shadow: 'shadow-secondary-500/20' },
    { label: 'Experience', value: `${stats?.experience || 15}Y`, icon: FiTrendingUp, color: 'bg-indigo-600', shadow: 'shadow-indigo-500/20' },
  ];

  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar />

      <main className="flex-1 overflow-auto medical-grid font-sans">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <h1 className="text-2xl font-black text-surface-900 font-display">
                Welcome, <span className="gradient-text">
                  Dr. {(profile?.User?.name || user?.name || 'Clinician').replace(/^(Dr\.\s*)+/i, '')}
                </span>
              </h1>
              <p className="text-[10px] text-surface-400 mt-1 font-black uppercase tracking-widest leading-none">
                System Status: Optimal • Clinical Queue: {queue.length > 0 ? 'Active' : 'Empty'}
              </p>
            </motion.div>

            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <p className="text-[11px] font-black text-surface-900 uppercase">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-[9px] text-primary-600 font-black uppercase tracking-widest">Institutional Portal</p>
              </div>
              <div className="w-10 h-10 bg-white rounded-xl border border-surface-200 flex items-center justify-center shadow-sm">
                <FiCalendar className="w-4.5 h-4.5 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {dashboardStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-2xl p-4.5 border border-surface-200 shadow-sm group hover:shadow-premium transition-all duration-500"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-9 h-9 ${stat.color} rounded-xl flex items-center justify-center shadow-md ${stat.shadow} transition-transform group-hover:scale-110`}>
                    <stat.icon className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="text-[10px] font-black text-secondary-600">+8%</div>
                </div>
                {loading ? (
                  <Skeleton width="40%" height="1.75rem" className="mb-1" />
                ) : (
                  <p className="text-2xl font-black text-surface-900 font-display mb-0.5">{stat.value}</p>
                )}
                <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Queue Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-surface-200 shadow-premium overflow-hidden">
                <div className="px-6 py-5 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
                  <div className="flex items-center gap-2">
                    <FiUsers className="text-primary-600" />
                    <h2 className="text-sm font-black uppercase tracking-widest text-surface-900">Patient Queue</h2>
                  </div>
                  <span className="px-2.5 py-1 bg-primary-100 text-primary-700 rounded-lg text-[9px] font-black uppercase">{queue.length} Pending</span>
                </div>

                <div className="p-0 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-surface-50/50 border-b border-surface-100">
                        <th className="px-6 py-4 text-[9px] font-black text-surface-400 uppercase tracking-widest">Patient</th>
                        <th className="px-6 py-4 text-[9px] font-black text-surface-400 uppercase tracking-widest">Time Slot</th>
                        <th className="px-6 py-4 text-[9px] font-black text-surface-400 uppercase tracking-widest text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-100">
                      {loading ? (
                        [1, 2, 3].map(i => (
                          <tr key={i}>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <Skeleton circle width="2.5rem" height="2.5rem" />
                                <div className="space-y-1">
                                  <Skeleton width="100px" height="0.75rem" />
                                  <Skeleton width="60px" height="0.5rem" />
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <Skeleton width="80px" height="0.75rem" className="mb-1" />
                              <Skeleton width="40px" height="0.5rem" />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Skeleton width="2rem" height="2rem" className="rounded-xl" />
                                <Skeleton width="4rem" height="2rem" className="rounded-xl" />
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : queue.map((slot) => (
                        <tr key={slot.id} className="hover:bg-primary-50/20 transition-all duration-200 group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-surface-50 border border-surface-200 rounded-xl flex items-center justify-center text-primary-600 text-xs font-black group-hover:bg-white group-hover:border-primary-200 transition-all">
                                {slot.Patient?.User?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                              </div>
                              <div>
                                <p className="text-xs font-black text-surface-900 uppercase tracking-tight">{slot.Patient?.User?.name}</p>
                                <p className="text-[9px] font-bold text-surface-400 uppercase">{slot.Patient?.age}Y • {slot.Patient?.gender}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-black text-surface-700 uppercase tracking-tight">{slot.start_time.substring(0, 5)} IST</p>
                            <p className="text-[9px] font-bold text-surface-400 uppercase">Duration: {slot.duration_minutes}m</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => viewPatientDetails(slot.patient_id)}
                                className="p-2 rounded-xl text-surface-400 hover:text-primary-600 hover:bg-white border border-transparent hover:border-surface-200 transition-all shadow-sm"
                                title="View EHR"
                              >
                                <FiEye className="w-4 h-4" />
                              </button>
                              <Button
                                variant="primary"
                                size="sm"
                                icon={FiVideo}
                                className="shadow-lg shadow-primary-500/20"
                                onClick={() => startConsultation(slot.id)}
                              >
                                JOIN
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {queue.length === 0 && (
                        <tr>
                          <td colSpan="3" className="px-6 py-20 text-center">
                            <div className="w-12 h-12 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <FiUsers className="w-6 h-6 text-surface-300" />
                            </div>
                            <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">No patients in queue</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar Dash Info */}
            <div className="space-y-6">
              {/* Live Sessions Card */}
              <div className="bg-white rounded-3xl border border-surface-200 shadow-premium p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-secondary-500 animate-pulse" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-surface-900">Live Sessions</h2>
                  </div>
                  <FiVideo className="text-secondary-600" />
                </div>
                
                <div className="space-y-4">
                  {consultations.map((c) => (
                    <div key={c.id} className="p-4 bg-surface-50 rounded-2xl border border-surface-100 hover:border-secondary-200 transition-all group cursor-pointer" onClick={() => navigate('/consultation', { state: { consultation: c } })}>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-secondary-600 rounded-lg flex items-center justify-center text-white text-[10px] font-black">
                          {c.Patient?.User?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-surface-900 uppercase truncate">{c.Patient?.User?.name}</p>
                          <p className="text-[8px] font-bold text-secondary-600 uppercase">Connected</p>
                        </div>
                      </div>
                      <Button variant="secondary" size="sm" className="w-full text-[9px]" icon={FiVideo}>Return to Call</Button>
                    </div>
                  ))}
                  {consultations.length === 0 && (
                    <div className="py-8 text-center bg-surface-50/50 rounded-2xl border border-dashed border-surface-200">
                      <p className="text-[9px] font-black text-surface-300 uppercase tracking-widest">No active sessions</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-primary-600 rounded-3xl shadow-premium p-6 text-white overflow-hidden relative group">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-all duration-700" />
                 <h3 className="text-sm font-black uppercase tracking-widest mb-2 relative z-10">Institutional Tools</h3>
                 <p className="text-[10px] text-primary-100 mb-6 font-medium relative z-10 leading-relaxed">Access documentation, schedule history, and clinical records.</p>
                 <div className="space-y-2 relative z-10">
                   <button onClick={() => navigate('/doctor/schedule')} className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between">
                     Manage Schedule <FiCalendar />
                   </button>
                   <button onClick={() => navigate('/doctor/schedule-history')} className="w-full py-2.5 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-left flex items-center justify-between">
                     View History <FiClock />
                   </button>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Patient EHR Modal */}
      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title="Clinical Patient Record"
        size="lg"
      >
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
                  <div className="p-5 bg-surface-50 rounded-[1.5rem] border border-surface-100 group hover:border-primary-200 transition-all">
                    <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-2">Patient Contact</p>
                    <p className="text-sm font-bold text-surface-900 mb-0.5">{selectedPatient.User?.phone}</p>
                    <p className="text-[10px] text-primary-600 font-bold">{selectedPatient.User?.email}</p>
                  </div>
                  <div className="p-5 bg-surface-50 rounded-[1.5rem] border border-surface-100 group hover:border-primary-200 transition-all">
                    <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-2">Operational Insight</p>
                    <p className="text-sm font-bold text-surface-900 mb-0.5">Last Intake</p>
                    <p className="text-[10px] text-surface-500 font-bold uppercase tracking-widest">
                      {selectedPatient.MedicalRecords?.[0] ? new Date(selectedPatient.MedicalRecords[0].createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'NO RECORDS'}
                    </p>
                  </div>
               </div>

               <div>
                 <div className="flex items-center justify-between mb-5">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Clinical History Timeline</p>
                    <div className="h-[1px] flex-1 bg-surface-100 mx-4" />
                 </div>
                 
                 <div className="space-y-6">
                    {selectedPatient.MedicalRecords?.map((record, i) => (
                      <div key={i} className="bg-white border border-surface-200 rounded-[2rem] shadow-sm overflow-hidden group hover:border-primary-200 transition-all duration-300">
                        <div className="px-6 py-4 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
                           <span className="text-[10px] font-black text-surface-900 uppercase tracking-widest flex items-center gap-2">
                             <FiCalendar className="text-primary-600" /> {new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </span>
                           <span className="text-[9px] font-black text-primary-500 uppercase px-3 py-1 bg-primary-100/50 rounded-lg tracking-tighter">Verified Record</span>
                        </div>
                        <div className="p-6 space-y-6">
                           <div className="p-5 bg-white rounded-2xl border border-surface-100 shadow-sm relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500" />
                              <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-2">Chief Complaint</p>
                              <p className="text-sm font-bold text-surface-800 leading-relaxed italic">"{record.symptoms}"</p>
                           </div>
                           
                           <div>
                             <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                               <FiFileText className="text-primary-500" /> Systemic History Details
                             </p>
                             {renderMedicalHistory(record.history)}
                           </div>
                        </div>
                      </div>
                    ))}
                    {(!selectedPatient.MedicalRecords || selectedPatient.MedicalRecords.length === 0) && (
                      <div className="text-center py-16 bg-surface-50/50 rounded-[2rem] border border-dashed border-surface-200">
                         <FiFileText className="w-10 h-10 text-surface-200 mx-auto mb-4" />
                         <p className="text-[10px] font-black text-surface-300 uppercase tracking-[0.2em]">No clinical documentation found</p>
                      </div>
                    )}
                 </div>
               </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

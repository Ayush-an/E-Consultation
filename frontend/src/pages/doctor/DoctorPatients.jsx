import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FiUsers, FiSearch, FiEye, FiPhone, FiMail, FiMapPin, FiFileText, FiCalendar
} from 'react-icons/fi';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export default function DoctorPatients() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    if (token) fetchPatients();
  }, [token]);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await fetch('/api/doctor/patients', { headers });
      const data = await res.json();
      if (data.status === 'success') setPatients(data.data);
    } catch (error) {
      addToast('Failed to load patients', 'error');
    } finally {
      setLoading(false);
    }
  };

  const viewDetails = async (patientId) => {
    try {
      const res = await fetch(`/api/doctor/patients/${patientId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') setSelectedPatient(data.data);
    } catch (error) {
      addToast('Failed to load patient details', 'error');
    }
  };

  const renderMedicalHistory = (historyStr) => {
    try {
      const data = JSON.parse(historyStr);
      return (
        <div className="space-y-1.5 mt-1 bg-surface-50 p-2.5 rounded-lg border border-surface-100">
          {data.diseases?.length > 0 && (
            <p className="text-[9px] text-surface-600 leading-relaxed"><span className="font-black uppercase text-primary-600">Conditions:</span> {data.diseases.filter(d => d !== 'None').join(', ')}</p>
          )}
          {data.allergies && data.allergies !== 'None' && (
            <p className="text-[9px] text-surface-600 leading-relaxed"><span className="font-black uppercase text-rose-500">Allergies:</span> {data.allergies}</p>
          )}
          {data.medications && data.medications !== 'None' && (
            <p className="text-[9px] text-surface-600 leading-relaxed"><span className="font-black uppercase text-secondary-600">Meds:</span> {data.medications}</p>
          )}
          {data.familyHistory && data.familyHistory !== 'None' && (
            <p className="text-[9px] text-surface-600 leading-relaxed"><span className="font-black uppercase text-amber-600">Family:</span> {data.familyHistory}</p>
          )}
        </div>
      );
    } catch (e) {
      return <p className="text-[10px] font-bold text-surface-700">{historyStr}</p>;
    }
  };

  const filtered = patients.filter((p) =>
    p.User?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar />
      <main className="flex-1 overflow-auto medical-grid">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20">
                <FiUsers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-surface-900 font-display">Patient <span className="gradient-text">Records</span></h1>
                <p className="text-[10px] text-surface-400 font-black uppercase tracking-widest">Complete clinical patient database</p>
              </div>
            </div>
          </motion.div>

          {/* Search + Count */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-sm group">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 group-focus-within:text-primary-600 transition-colors" />
              <input
                type="text"
                placeholder="Search patients by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 text-xs bg-white focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all font-bold shadow-sm"
              />
            </div>
            <div className="px-4 py-2 bg-white rounded-xl border border-surface-200 text-[10px] font-black text-surface-500 uppercase tracking-widest shadow-sm">
              {filtered.length} Patient{filtered.length !== 1 ? 's' : ''} Found
            </div>
          </div>

          {/* Patient Grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((patient, i) => (
              <motion.div
                key={patient.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl border border-surface-200 p-5 shadow-sm hover:shadow-premium hover:border-primary-200 transition-all duration-500 group cursor-pointer"
                onClick={() => viewDetails(patient.id)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-transform">
                    {patient.User?.name?.split(' ').map(n => n[0]).join('') || 'P'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-black text-surface-900 uppercase tracking-tight truncate group-hover:text-primary-700 transition-colors">{patient.User?.name}</h3>
                    <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest">{patient.age}Y • {patient.gender}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-50 border border-surface-100 text-surface-400 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-200 transition-all">
                    <FiEye className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-surface-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <FiMail className="w-3 h-3 text-surface-400 shrink-0" />
                    <span className="truncate">{patient.User?.email || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FiPhone className="w-3 h-3 text-surface-400 shrink-0" />
                    <span>{patient.User?.phone || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && !loading && (
            <div className="text-center py-24 border-2 border-dashed border-surface-200 rounded-3xl mt-4">
              <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-7 h-7 text-surface-300" />
              </div>
              <p className="text-sm font-black text-surface-400 uppercase tracking-widest">No patients found</p>
              <p className="text-xs text-surface-300 mt-2 font-medium">Complete consultations to build your patient database.</p>
            </div>
          )}
        </div>
      </main>

      {/* Patient Detail Modal */}
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
                {selectedPatient.User?.name?.split(' ').map((n) => n[0]).join('') || 'P'}
              </div>
              <div>
                <h3 className="text-2xl font-extrabold text-surface-900 font-display mb-1">{selectedPatient.User?.name}</h3>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="px-2.5 py-1 bg-surface-100 rounded-lg text-[10px] font-black text-surface-600 uppercase tracking-widest">{selectedPatient.gender}</span>
                  <span className="px-2.5 py-1 bg-surface-100 rounded-lg text-[10px] font-black text-surface-600 uppercase tracking-widest">{selectedPatient.age} Years</span>
                  <span className="px-2.5 py-1 bg-primary-50 rounded-lg text-[10px] font-black text-primary-600 uppercase tracking-widest border border-primary-100">ID: PAT-{selectedPatient.id.substring(0, 6).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="p-5 bg-surface-50 rounded-[1.5rem] border border-surface-100 group hover:border-primary-200 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <FiMail className="w-3.5 h-3.5 text-primary-500" />
                  <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest">Email Address</p>
                </div>
                <p className="text-sm font-bold text-surface-900">{selectedPatient.User?.email || 'Not provided'}</p>
              </div>
              <div className="p-5 bg-surface-50 rounded-[1.5rem] border border-surface-100 group hover:border-primary-200 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <FiPhone className="w-3.5 h-3.5 text-primary-500" />
                  <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest">Phone Number</p>
                </div>
                <p className="text-sm font-bold text-surface-900">{selectedPatient.User?.phone || 'Not provided'}</p>
              </div>
              <div className="p-5 bg-surface-50 rounded-[1.5rem] border border-surface-100 col-span-full group hover:border-primary-200 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <FiMapPin className="w-3.5 h-3.5 text-primary-500" />
                  <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest">Registered Address</p>
                </div>
                <p className="text-sm font-bold text-surface-900">{selectedPatient.address || 'Not provided'}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-5">
                <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Medical History Timeline</p>
                <div className="h-[1px] flex-1 bg-surface-100 mx-4" />
              </div>

              <div className="space-y-6">
                {/* Unified Timeline: Combine MedicalRecords and Consultations if possible, or just show them together */}
                {selectedPatient.Consultations?.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Past Consultations & Prescriptions</p>
                    {selectedPatient.Consultations.map((con, i) => (
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
                             <p className="text-[10px] text-surface-400 font-bold italic">No prescription issued for this session.</p>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {selectedPatient.MedicalRecords?.length > 0 && (
                  <div className="space-y-4">
                    <p className="text-[10px] font-black text-surface-400 uppercase tracking-[0.2em]">Intake Forms & Self-Reported History</p>
                    {selectedPatient.MedicalRecords.map((record, i) => (
                      <div key={i} className="bg-white border border-surface-200 rounded-[2rem] shadow-sm overflow-hidden group hover:border-primary-200 transition-all duration-300">
                        <div className="px-6 py-4 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
                           <span className="text-[10px] font-black text-surface-900 uppercase tracking-widest flex items-center gap-2">
                             <FiCalendar className="text-primary-600" /> {new Date(record.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                           </span>
                           <span className="text-[9px] font-black text-primary-500 uppercase px-3 py-1 bg-primary-100/50 rounded-lg tracking-tighter">Verified Clinical Entry</span>
                        </div>
                        
                        <div className="p-6 space-y-6">
                          <div className="p-5 bg-white rounded-2xl border border-surface-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary-500" />
                            <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-2">Symptoms Description</p>
                            <p className="text-sm font-bold text-surface-800 leading-relaxed italic">"{record.symptoms}"</p>
                          </div>
    
                          <div>
                            <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                              <FiFileText className="text-primary-500" /> Systemic History Details
                            </p>
                            {renderMedicalHistory(record.history)}
                          </div>
    
                          {record.reports?.length > 0 && (
                            <div className="pt-4 border-t border-surface-100">
                              <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-3">Diagnostic Attachments</p>
                              <div className="flex flex-wrap gap-2">
                                {record.reports.map((file, fIdx) => (
                                  <a key={fIdx} href={file.url} target="_blank" rel="noopener noreferrer"
                                    className="px-4 py-2.5 bg-surface-50 border border-surface-200 rounded-xl hover:border-primary-500 hover:text-primary-600 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-tight">
                                    <FiFileText className="w-3.5 h-3.5 text-primary-500" />
                                    {file.name}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {(!selectedPatient.MedicalRecords || selectedPatient.MedicalRecords.length === 0) && (!selectedPatient.Consultations || selectedPatient.Consultations.length === 0) && (
                  <div className="text-center py-16 bg-surface-50/50 rounded-[2rem] border border-dashed border-surface-200">
                     <FiFileText className="w-10 h-10 text-surface-200 mx-auto mb-4" />
                     <p className="text-[10px] font-black text-surface-300 uppercase tracking-[0.2em]">No clinical documentation found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

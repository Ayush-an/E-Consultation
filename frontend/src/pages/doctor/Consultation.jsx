
import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMic, FiMicOff, FiVideo, FiVideoOff, FiPhoneOff, FiMessageSquare,
  FiUser, FiHeart, FiActivity, FiSend, FiClock, FiFileText, FiPlus, FiX, FiSave,
  FiMonitor, FiShield, FiMoreVertical
} from 'react-icons/fi';
import { BiClipboard } from 'react-icons/bi';
import { GiPill } from 'react-icons/gi';
import Tabs from '../../components/Tabs';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { useWebRTC } from '../../hooks/useWebRTC';
import { mockPatients } from '../../utils/mockData';

export default function Consultation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user, token } = useAuth();
  const consultation = location.state?.consultation;
  const patient = consultation?.Patient || location.state?.patient || mockPatients[1];

  const isDoctor = user?.role === 'DOCTOR';

  // Extract clean names
  const rawDocName = isDoctor ? user?.name : consultation?.Doctor?.User?.name || 'Sameer Mehta';
  const doctorName = (rawDocName || 'Clinician').replace(/^(Dr\.\s*)+/i, '');

  const rawPatName = !isDoctor ? user?.name : patient?.User?.name || patient?.name || 'Mayur Sharma';
  const patientName = (rawPatName || 'Patient').replace(/^(Dr\.\s*)+/i, '');

  const roomId = consultation?.id || consultation?.slot_id || 'DEMO-SESSION';

  // WebRTC
  const {
    localVideoRef, remoteVideoRef,
    isConnected, remoteConnected,
    micOn, videoOn, isScreenSharing, connectionState,
    messages, remoteMicOn, remoteVideoOn,
    initialize, toggleMic, toggleVideo, toggleScreenShare,
    sendMessage: rtcSendMessage, endCall: rtcEndCall,
  } = useWebRTC({ roomId, userId: user?.id || 'anon', role: isDoctor ? 'doctor' : 'patient' });

  const [chatOpen, setChatOpen] = useState(true);
  const [prescriptionOpen, setPrescriptionOpen] = useState(false);
  const [timer, setTimer] = useState(0);
  const [infoTab, setInfoTab] = useState('basic');
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef(null);

  // Prescription state
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '', instructions: '' }]);
  const [doctorNotes, setDoctorNotes] = useState('');

  // Init WebRTC on mount
  useEffect(() => { initialize(); }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    rtcSendMessage(chatInput, isDoctor ? 'doctor' : 'patient', isDoctor ? `Dr. ${doctorName}` : patient?.name || 'Patient');
    setChatInput('');
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const addMedicine = () => setMedicines(prev => [...prev, { name: '', dosage: '', duration: '', instructions: '' }]);
  const updateMedicine = (i, field, val) => setMedicines(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  const removeMedicine = (i) => { if (medicines.length > 1) setMedicines(prev => prev.filter((_, idx) => idx !== i)); };

  const generatePrescription = async () => {
    if (!diagnosis.trim()) { addToast('Please enter a diagnosis', 'error'); return; }
    try {
      if (consultation?.id && token) {
        await fetch('/api/doctor/prescriptions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            consultationId: consultation.id,
            diagnosis,
            medicines: medicines.filter(m => m.name.trim()),
            notes: doctorNotes
          })
        });
      }
    } catch (e) { console.error(e); }

    const prescription = {
      id: Date.now(), patientId: patient?.id, patientName: patient?.name || patient?.User?.name,
      date: new Date().toISOString().split('T')[0], diagnosis,
      medicines: medicines.filter(m => m.name.trim()), notes: doctorNotes,
      doctorName: `Dr. ${doctorName}`, websiteName: 'E-Consultation',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };
    addToast('Prescription signed and issued.', 'success');
    setPrescriptionOpen(false);
    // Notify patient via socket
    rtcSendMessage(`PRESCRIPTION_ISSUED:${JSON.stringify(prescription)}`, 'system', 'Clinical Staff');
  };

  const endCall = async () => {
    rtcEndCall();
    try {
      if (consultation?.id) {
        await fetch(`/api/doctor/queue/${consultation.id}/end`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
      }
    } catch (e) { console.error(e); }
    addToast('Consultation session closed.', 'info');
    navigate(isDoctor ? '/doctor' : '/patient-dashboard');
  };

  const infoTabs = [
    { id: 'basic', label: 'EHR Profile', icon: FiUser },
    { id: 'medical', label: 'Clinical History', icon: FiHeart },
    { id: 'symptoms', label: 'Vitals & Chief Complaint', icon: FiActivity },
  ];


  return (
    <div className="min-h-screen bg-surface-50 flex flex-col font-sans selection:bg-primary-500/30">
      {/* Top HUD */}
      <div className="h-14 bg-white border-b border-surface-200 flex items-center justify-between px-6 lg:px-8 z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-md shadow-primary-500/10">
              <FiShield className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-surface-900 font-black text-[11px] tracking-tight font-display uppercase">Secure Clinical Uplink</p>
              <p className="text-[8px] text-surface-400 font-black tracking-widest uppercase mt-0.5">SESSION ID: {roomId?.toString().substring(0, 12).toUpperCase()}</p>
            </div>
          </div>
          <div className="hidden sm:block h-5 w-[1px] bg-surface-200 mx-1" />
          <div className="hidden md:flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${remoteConnected ? 'bg-secondary-500 animate-pulse' : 'bg-amber-500'}`} />
            <p className={`text-[9px] font-black tracking-widest uppercase ${remoteConnected ? 'text-secondary-500' : 'text-amber-500'}`}>
              {remoteConnected ? 'PEER CONNECTED' : 'WAITING FOR PEER'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-50 rounded-xl border border-surface-200">
            <FiClock className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-[11px] font-mono font-black text-surface-900 tracking-widest">{formatTime(timer)}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Video Grid */}
        <div className="flex-1 p-4 lg:p-6 flex flex-col relative z-10">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Remote Video */}
            <div className="relative group rounded-3xl overflow-hidden bg-surface-100 border border-surface-200 shadow-premium">
              <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              {!remoteConnected && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-50">
                  <div className="w-20 h-20 bg-primary-600/10 rounded-3xl flex items-center justify-center mb-4">
                    <span className="text-2xl font-black text-primary-600">{patientName.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <p className="text-surface-400 text-[10px] font-black uppercase tracking-widest">Waiting for connection...</p>
                  <div className="mt-3 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                    <span className="text-amber-600 text-[9px] font-black uppercase tracking-widest">Signaling</span>
                  </div>
                </div>
              )}
              <div className="absolute top-4 left-4 px-2 py-0.5 bg-white/80 backdrop-blur-md rounded border border-surface-200 text-[8px] text-surface-900 font-black tracking-[0.2em] uppercase">
                {isDoctor ? `PATIENT: ${patientName.toUpperCase()}` : `DOCTOR: DR. ${doctorName.toUpperCase()}`}
              </div>
              {!remoteVideoOn && remoteConnected && (
                <div className="absolute inset-0 bg-surface-100 flex items-center justify-center">
                  <FiVideoOff className="w-10 h-10 text-surface-300" />
                </div>
              )}
            </div>

            {/* Local Video */}
            <div className="relative group rounded-3xl overflow-hidden bg-surface-100 border border-surface-200 shadow-premium">
              <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover mirror" />
              {!videoOn && (
                <div className="absolute inset-0 bg-surface-100 flex items-center justify-center">
                  <FiVideoOff className="w-10 h-10 text-surface-300" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="px-2 py-0.5 bg-white/80 backdrop-blur-md rounded border border-surface-200 text-[8px] text-surface-900 font-black tracking-[0.2em] uppercase">
                  {isDoctor ? `DR. ${doctorName.toUpperCase()} (YOU)` : `PATIENT: ${patientName.toUpperCase()} (YOU)`}
                </div>
                {isScreenSharing && (
                  <div className="px-2 py-0.5 bg-amber-500/80 backdrop-blur-md rounded text-[8px] text-white font-black tracking-widest uppercase">SHARING SCREEN</div>
                )}
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleMic}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl cursor-pointer ${micOn ? 'bg-white text-surface-700 hover:bg-surface-50 border border-surface-200' : 'bg-red-500 text-white shadow-red-500/20'}`}>
              {micOn ? <FiMic className="w-5 h-5" /> : <FiMicOff className="w-5 h-5" />}
            </motion.button>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleVideo}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl cursor-pointer ${videoOn ? 'bg-white text-surface-700 hover:bg-surface-50 border border-surface-200' : 'bg-red-500 text-white shadow-red-500/20'}`}>
              {videoOn ? <FiVideo className="w-5 h-5" /> : <FiVideoOff className="w-5 h-5" />}
            </motion.button>

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleScreenShare}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl cursor-pointer ${isScreenSharing ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-white text-surface-700 hover:bg-surface-50 border border-surface-200'}`}>
              <FiMonitor className="w-5 h-5" />
            </motion.button>

            <div className="w-[1px] h-8 bg-surface-200 mx-1" />

            {isDoctor && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setPrescriptionOpen(true)}
                className="px-6 h-14 rounded-2xl bg-primary-600 text-white font-black flex items-center gap-2.5 hover:bg-primary-500 transition-all shadow-xl shadow-primary-600/20 cursor-pointer">
                <BiClipboard className="w-5 h-5" />
                <span className="tracking-widest text-[10px] uppercase">Initialize Rx</span>
              </motion.button>
            )}

            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={endCall}
              className="w-16 h-14 rounded-2xl bg-red-600 text-white flex items-center justify-center hover:bg-red-500 transition-all shadow-xl shadow-red-600/20 cursor-pointer">
              <FiPhoneOff className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Side Panel */}
        <div className="w-full lg:w-[380px] bg-white border-l border-surface-200 flex flex-col z-10 shadow-premium">
          <div className="p-4 border-b border-surface-200">
            <div className="flex gap-1.5 p-1 bg-surface-50 rounded-xl border border-surface-200">
              <button onClick={() => setChatOpen(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${!chatOpen ? 'bg-white text-primary-600 shadow-sm border border-surface-200' : 'text-surface-400 hover:text-surface-600'}`}>
                <FiUser className="w-3.5 h-3.5" /> PROFILE
              </button>
              <button onClick={() => setChatOpen(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all ${chatOpen ? 'bg-white text-primary-600 shadow-sm border border-surface-200' : 'text-surface-400 hover:text-surface-600'}`}>
                <FiMessageSquare className="w-3.5 h-3.5" /> CHAT
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!chatOpen ? (
              <motion.div key="info" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                <div className="px-6 py-6 overflow-y-auto custom-scrollbar space-y-8">
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-primary-600 rounded-3xl flex items-center justify-center text-white text-2xl font-black shadow-xl">
                      {patientName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-xl font-extrabold text-surface-900 font-display mb-1">{patientName}</h3>
                      <p className="text-[10px] text-primary-500 font-bold tracking-[0.2em] uppercase">Status: Verified EHR</p>
                    </div>
                  </div>
                  <Tabs tabs={infoTabs} activeTab={infoTab} onChange={setInfoTab} />
                  <div className="space-y-4">
                    {infoTab === 'basic' && (
                      <div className="grid gap-3">
                        {[
                          { label: 'Primary Contact', value: patient?.phone || patient?.User?.phone },
                          { label: 'Email', value: patient?.email || patient?.User?.email },
                          { label: 'Clinical Stats', value: `${patient?.age || 'N/A'}Y • ${patient?.gender || 'N/A'}` },
                        ].map(item => (
                          <div key={item.label} className="p-5 bg-surface-50 rounded-2xl border border-surface-200">
                            <p className="text-[10px] text-surface-400 font-black tracking-widest uppercase mb-1.5">{item.label}</p>
                            <p className="text-sm font-bold text-surface-900">{item.value || 'N/A'}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {infoTab === 'medical' && (
                      <div className="p-5 bg-surface-50 rounded-2xl border border-surface-200 text-center">
                        <p className="text-[10px] text-surface-400 font-black uppercase">Patient medical records available from EHR</p>
                      </div>
                    )}
                    {infoTab === 'symptoms' && (
                      <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100 text-center">
                        <p className="text-[10px] text-primary-600 font-black tracking-widest uppercase mb-3">Chief Complaint</p>
                        <p className="text-base text-surface-900 font-medium italic">"{patient?.symptoms || 'Discuss during session'}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'doctor' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                      {msg.sender === 'system' ? (
                        msg.text.startsWith('PRESCRIPTION_ISSUED:') ? (
                          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex flex-col items-center gap-2">
                            <p className="text-[10px] text-emerald-600 font-black tracking-widest uppercase">Digital Rx Issued</p>
                            <Button size="sm" variant="primary" onClick={() => navigate('/pdr', { state: { prescription: JSON.parse(msg.text.split('PRESCRIPTION_ISSUED:')[1]), patient } })}>VIEW & DOWNLOAD Rx</Button>
                          </div>
                        ) : (
                          <span className="text-[9px] text-surface-400 tracking-[0.3em] uppercase font-black opacity-50">{msg.text}</span>
                        )
                      ) : (
                        <div className="flex flex-col gap-1 max-w-[85%]">
                          <p className={`text-[9px] font-black tracking-widest uppercase px-2 ${msg.sender === 'doctor' ? 'text-right text-primary-600' : 'text-left text-surface-400'}`}>
                            {msg.senderName || (msg.sender === 'doctor' ? 'Clinical Staff' : 'Patient')}
                          </p>
                          <div className={`px-5 py-3.5 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.sender === 'doctor' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-surface-100 text-surface-900 rounded-tl-none border border-surface-200'}`}>
                            {msg.text}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-6 bg-surface-50 border-t border-surface-200">
                  <div className="flex gap-3 items-center">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Enter message..."
                      className="flex-1 px-6 py-4 rounded-2xl bg-white border border-surface-200 text-sm text-surface-900 placeholder:text-surface-400 focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all font-medium" />
                    <button onClick={handleSendMessage}
                      className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white hover:bg-primary-500 transition-all cursor-pointer shadow-lg shadow-primary-600/20">
                      <FiSend className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Prescription Modal */}
      {isDoctor && (
        <Modal isOpen={prescriptionOpen} onClose={() => setPrescriptionOpen(false)} title="DIGITAL RX ISSUANCE" size="xl">
          <div className="space-y-8 p-2">
            <div>
              <label className="flex items-center gap-2 text-[10px] font-black text-surface-500 uppercase tracking-widest mb-3">
                <FiActivity className="w-3.5 h-3.5" /> PRIMARY CLINICAL DIAGNOSIS *
              </label>
              <textarea rows={3} placeholder="Enter diagnosis..." value={diagnosis} onChange={e => setDiagnosis(e.target.value)}
                className="w-full px-5 py-4 rounded-[1.5rem] border border-surface-200 text-sm bg-surface-50 placeholder:text-surface-400 focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 resize-none font-bold transition-all" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-5">
                <label className="flex items-center gap-2 text-[10px] font-black text-surface-500 uppercase tracking-widest">
                  <GiPill className="w-4 h-4" /> PHARMACOLOGICAL REGIMEN
                </label>
                <button onClick={addMedicine}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-100 transition-all cursor-pointer border border-primary-200">
                  <FiPlus className="w-3.5 h-3.5" /> ADD
                </button>
              </div>
              <div className="space-y-4">
                {medicines.map((med, i) => (
                  <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-white rounded-3xl border border-surface-200 shadow-sm relative group/item">
                    {medicines.length > 1 && (
                      <button onClick={() => removeMedicine(i)} className="absolute top-4 right-4 text-surface-300 hover:text-red-500 transition-all cursor-pointer opacity-0 group-hover/item:opacity-100">
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input label="COMPOUND" placeholder="e.g. Paracetamol" value={med.name} onChange={e => updateMedicine(i, 'name', e.target.value.toUpperCase())} />
                      <Input label="DOSAGE" placeholder="e.g. 500 MG" value={med.dosage} onChange={e => updateMedicine(i, 'dosage', e.target.value.toUpperCase())} />
                      <Input label="DURATION" placeholder="e.g. 10 DAYS" value={med.duration} onChange={e => updateMedicine(i, 'duration', e.target.value.toUpperCase())} />
                      <Input label="INSTRUCTIONS" placeholder="e.g. AFTER MEALS" value={med.instructions} onChange={e => updateMedicine(i, 'instructions', e.target.value.toUpperCase())} />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Button variant="outline" onClick={toggleScreenShare} icon={FiMonitor} className={`w-full sm:w-auto px-6 py-4 h-auto rounded-[1.25rem] ${isScreenSharing ? 'bg-amber-50 text-amber-600 border-amber-200' : ''}`}>
                {isScreenSharing ? 'STOP SHARING' : 'SHARE SCREEN'}
              </Button>
              <div className="hidden sm:block flex-1" />
              <Button variant="primary" onClick={generatePrescription} icon={FiFileText} className="w-full sm:w-auto px-10 py-5 rounded-[1.25rem] shadow-float">SIGN & DISTRIBUTE Rx</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

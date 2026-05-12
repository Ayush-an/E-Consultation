import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiHeart, FiCalendar, FiDownload, FiUser, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

export default function PatientPrescriptions() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchPrescriptions();
  }, [token]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') setPrescriptions(data.data.prescriptions || []);
    } catch (error) {
      addToast('Failed to load prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <FiHeart className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black text-surface-900 font-display uppercase tracking-tight">Clinical <span className="gradient-text">Prescriptions</span></h1>
        </div>
        <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.2em] leading-none ml-13">Verified Digital Rx & Pharmacological Regimens</p>
      </motion.div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 bg-white rounded-[2.5rem] border border-surface-200 animate-pulse" />
          ))}
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {prescriptions.map((rx, i) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[2.5rem] border border-surface-200 shadow-premium overflow-hidden group hover:border-primary-200 transition-all duration-500 flex flex-col"
            >
              <div className="p-8 flex-1">
                <div className="flex items-start justify-between mb-6">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-primary-100 group-hover:scale-110 transition-transform">
                       <FiUser className="w-5 h-5" />
                     </div>
                     <div>
                       <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest leading-none mb-1">Prescribed By</p>
                       <p className="text-sm font-black text-surface-900 uppercase truncate">Dr. {rx.Consultation?.Doctor?.User?.name || 'Medical Specialist'}</p>
                     </div>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-black text-surface-900 uppercase tracking-widest leading-none mb-1">{new Date(rx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}</p>
                     <p className="text-[8px] font-black text-surface-400 uppercase tracking-widest">{new Date(rx.createdAt).getFullYear()}</p>
                   </div>
                </div>

                <div className="p-5 bg-surface-50 rounded-2xl border border-surface-100 mb-6 group-hover:border-primary-100 transition-colors">
                  <p className="text-[9px] font-black text-surface-400 uppercase tracking-widest mb-1.5">Diagnosis</p>
                  <p className="text-[11px] font-black text-surface-900 uppercase leading-relaxed line-clamp-2">{rx.diagnosis}</p>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {rx.medicines?.map((m, mi) => (
                    <span key={mi} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-xl border border-emerald-100 uppercase tracking-tight">
                      {m.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-8 py-6 bg-surface-50 border-t border-surface-100 flex items-center gap-3">
                <Button 
                  size="sm" 
                  variant="primary" 
                  className="flex-1 rounded-xl"
                  icon={FiExternalLink}
                  onClick={() => navigate('/pdr', { state: { prescription: rx } })}
                >
                  VIEW FULL Rx
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="rounded-xl border-surface-200 bg-white"
                  icon={FiDownload}
                  onClick={() => addToast('Digital Rx download initiated.', 'success')}
                >
                  DOWNLOAD
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-dashed border-surface-200 p-20 text-center">
          <FiHeart className="w-16 h-16 text-surface-200 mx-auto mb-6" />
          <p className="text-sm font-black text-surface-400 uppercase tracking-[0.3em]">No Prescriptions Available</p>
          <p className="text-xs text-surface-300 mt-2 font-medium uppercase tracking-widest">Consult a specialist to receive digital clinical prescriptions.</p>
        </div>
      )}
    </div>
  );
}

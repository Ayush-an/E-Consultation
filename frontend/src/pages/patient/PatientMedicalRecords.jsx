import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiCalendar, FiFileText, FiDownload, FiSearch, FiClock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export default function PatientMedicalRecords() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) fetchRecords();
  }, [token]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients/intake-history', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') setRecords(data.data);
    } catch (error) {
      addToast('Failed to load medical records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const renderHistory = (historyStr) => {
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

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
            <FiActivity className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-black text-surface-900 font-display uppercase tracking-tight">Medical <span className="gradient-text">Records</span></h1>
        </div>
        <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.2em] leading-none ml-13">Verified Clinical History & Intake Forms</p>
      </motion.div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-surface-200 animate-pulse" />
          ))}
        </div>
      ) : records.length > 0 ? (
        <div className="grid gap-6">
          {records.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-[2.5rem] border border-surface-200 shadow-premium overflow-hidden group hover:border-primary-200 transition-all duration-500"
            >
              <div className="px-8 py-5 bg-surface-50 border-b border-surface-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-white rounded-xl border border-surface-200 text-primary-600 shadow-sm group-hover:scale-110 transition-transform">
                    <FiCalendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-surface-900 uppercase tracking-widest leading-none">Record Entry</p>
                    <p className="text-xs font-bold text-surface-400 mt-1">{new Date(record.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-lg text-[9px] font-black uppercase tracking-tighter">Verified</span>
              </div>

              <div className="p-8 grid md:grid-cols-2 gap-8">
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3">
                    <FiClock className="w-3.5 h-3.5" /> Primary Symptoms
                  </label>
                  <p className="text-sm font-bold text-surface-800 leading-relaxed italic bg-surface-50 p-4 rounded-2xl border border-surface-100 group-hover:border-primary-100 transition-colors">
                    "{record.symptoms}"
                  </p>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3">
                    <FiFileText className="w-3.5 h-3.5" /> Health Background
                  </label>
                  {renderHistory(record.history)}
                </div>
              </div>

              {record.reports?.length > 0 && (
                <div className="px-8 pb-8 flex flex-wrap gap-3">
                  {record.reports.map((report, idx) => (
                    <a
                      key={idx}
                      href={report.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-surface-50 border border-surface-200 rounded-xl text-[10px] font-black uppercase tracking-tight text-surface-600 hover:text-primary-600 hover:border-primary-500 transition-all"
                    >
                      <FiDownload className="w-3.5 h-3.5 text-primary-500" />
                      {report.name}
                    </a>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-dashed border-surface-200 p-20 text-center">
          <FiFileText className="w-16 h-16 text-surface-200 mx-auto mb-6" />
          <p className="text-sm font-black text-surface-400 uppercase tracking-[0.3em]">No Medical Records Found</p>
          <p className="text-xs text-surface-300 mt-2 font-medium uppercase tracking-widest">Complete your clinical intake form to see your records here.</p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiDownload, FiExternalLink } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

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
      const res = await fetch('/api/patients/prescriptions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') setPrescriptions(data.data);
    } catch {
      addToast('Failed to load prescriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-800">Prescriptions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Prescriptions issued by your doctors after consultations</p>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-white border border-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : prescriptions.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-4">
          {prescriptions.map((rx, i) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-400">Prescribed by</p>
                    <p className="text-sm font-medium text-gray-800">
                      Dr. {rx.Consultation?.Doctor?.User?.name || 'Doctor'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(rx.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 mb-3">
                  <p className="text-xs text-gray-400 mb-0.5">Diagnosis</p>
                  <p className="text-sm text-gray-800">{rx.diagnosis}</p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {rx.medicines?.map((m, mi) => (
                    <span key={mi} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md border border-blue-100">
                      {m.name}{m.dosage ? ` · ${m.dosage}` : ''}
                    </span>
                  ))}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 flex gap-2">
                <button
                  onClick={() => navigate('/pdr', { state: { prescription: rx } })}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  <FiExternalLink className="w-3.5 h-3.5" /> View Rx
                </button>
                <button
                  onClick={() => navigate('/pdr', { state: { prescription: rx } })}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50"
                >
                  <FiDownload className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <FiHeart className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No prescriptions yet</p>
          <p className="text-xs text-gray-400 mt-1">Prescriptions from your doctor will appear here after consultations</p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FiActivity, FiCalendar, FiFileText, FiUpload, FiDownload, FiPlus, FiX,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

export default function PatientMedicalRecords() {
  const { token } = useAuth();
  const { addToast } = useToast();
  const fileRef = useRef(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (token) fetchRecords();
  }, [token]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patients/medical-records', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') setRecords(data.data);
    } catch {
      addToast('Failed to load medical records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('document', file);
    formData.append('title', title || file.name);

    try {
      const res = await fetch('/api/patients/medical-records/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      if (data.status === 'success') {
        addToast('Document uploaded successfully', 'success');
        setTitle('');
        if (fileRef.current) fileRef.current.value = '';
        fetchRecords();
      } else {
        addToast(data.message || 'Upload failed', 'error');
      }
    } catch {
      addToast('Upload failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const renderHistory = (historyStr) => {
    if (!historyStr) return null;
    try {
      const data = JSON.parse(historyStr);
      return (
        <div className="mt-2 space-y-1 text-xs text-gray-600">
          {data.diseases?.length > 0 && <p>Conditions: {data.diseases.filter((d) => d !== 'None').join(', ')}</p>}
          {data.allergies && data.allergies !== 'None' && <p>Allergies: {data.allergies}</p>}
          {data.notes && <p>Notes: {data.notes}</p>}
        </div>
      );
    } catch {
      return <p className="text-xs text-gray-600 mt-1">{historyStr}</p>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Medical Records</h1>
          <p className="text-sm text-gray-500 mt-0.5">Your health history and uploaded documents</p>
        </div>
        <Link
          to="/patient-form"
          className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FiPlus className="w-4 h-4" /> Health profile form
        </Link>
      </div>

      {/* Upload */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Upload document</h2>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Document title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          <label className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
            <FiUpload className="w-4 h-4" />
            {uploading ? 'Uploading...' : 'Choose file'}
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-xs text-gray-400 mt-2">PDF or images up to 10MB</p>
      </div>

      {/* Records list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-white border border-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : records.length > 0 ? (
        <div className="space-y-4">
          {records.map((record, i) => (
            <motion.div
              key={record.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <FiActivity className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-800">
                    {new Date(record.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
                <span className="text-xs text-gray-400">Record</span>
              </div>
              <div className="p-5">
                {record.symptoms && (
                  <p className="text-sm text-gray-700">{record.symptoms}</p>
                )}
                {renderHistory(record.history)}
                {record.reports?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {record.reports.map((report, idx) => (
                      <a
                        key={idx}
                        href={report.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        <FiDownload className="w-3.5 h-3.5" />
                        {report.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-dashed border-gray-200 rounded-xl p-12 text-center">
          <FiFileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No medical records yet</p>
          <p className="text-xs text-gray-400 mt-1">Upload a document or complete your health profile form</p>
        </div>
      )}
    </div>
  );
}

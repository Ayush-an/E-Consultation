import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiFileText, FiVideo, FiPlus, FiDownload,
  FiClock, FiHeart, FiActivity, FiAlertCircle, FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';
import { Skeleton } from '../../components/Skeleton';

const actions = [
  { label: 'Book Appointment', desc: 'Schedule a consultation', path: '/patient-booking', icon: FiCalendar, color: 'text-blue-500 bg-blue-50' },
  { label: 'Health Profile', desc: 'Update your health info', path: '/patient-form', icon: FiFileText, color: 'text-emerald-600 bg-emerald-50' },
  { label: 'Medical Records', desc: 'View & upload documents', path: '/medical-records', icon: FiActivity, color: 'text-violet-600 bg-violet-50' },
  { label: 'Prescriptions', desc: 'Doctor prescriptions', path: '/prescriptions', icon: FiHeart, color: 'text-rose-600 bg-rose-50' },
];

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [intakeComplete, setIntakeComplete] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalPrescriptions: 0,
    totalRecords: 0,
    upcomingSessions: [],
    prescriptions: [],
    medicalRecords: [],
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      const intakeRes = await fetch('/api/patients/intake-status', { headers });
      const intakeData = await intakeRes.json();
      if (intakeData.status === 'success') setIntakeComplete(intakeData.data.completed);

      const dashRes = await fetch('/api/patients/dashboard', { headers });
      const dashData = await dashRes.json();
      if (dashData.status === 'success') setStats(dashData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (t) => (t ? t.substring(0, 5) : '—');

  const joinConsultation = async (slot) => {
    try {
      const res = await fetch(`/api/patients/consultation/slot/${slot.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') {
        navigate('/consultation', {
          state: { consultation: { ...data.data, Doctor: slot.Doctor } },
        });
      }
    } catch {
      navigate('/consultation', {
        state: { consultation: { slot_id: slot.id, Doctor: slot.Doctor } },
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
              Hello, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {loading ? 'Loading...' : `${stats.totalAppointments} appointments · ${stats.totalPrescriptions} prescriptions · ${stats.totalRecords} records`}
            </p>
          </div>
          <Link
            to="/patient-booking"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Book Appointment
          </Link>
        </div>
      </div>

      {!loading && !intakeComplete && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Complete your health profile</p>
            <p className="text-xs text-gray-600 mt-0.5">Required before booking appointments.</p>
          </div>
          <Link to="/patient-form" className="text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap">
            Complete →
          </Link>
        </div>
      )}

      {/* Main actions — same as sidebar, primary dashboard navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {actions.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-gray-800">{item.label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            <FiChevronRight className="w-4 h-4 text-gray-300 mt-2 group-hover:text-blue-400 transition-colors" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <FiCalendar className="w-4 h-4 text-gray-400" />
              Upcoming Appointments
            </h2>
            <Link to="/patient-booking" className="text-xs font-medium text-blue-600 hover:text-blue-700">
              + Book new
            </Link>
          </div>
          <div className="p-4 space-y-3 max-h-[320px] overflow-y-auto">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-lg"><Skeleton height="2.5rem" /></div>
              ))
            ) : stats.upcomingSessions.length > 0 ? (
              stats.upcomingSessions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center justify-between gap-4 p-4 border border-gray-100 rounded-lg"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">Dr. {s.Doctor?.User?.name || 'Doctor'}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <FiClock className="w-3 h-3" />
                      {s.date} · {formatTime(s.start_time)} – {formatTime(s.end_time)}
                    </p>
                  </div>
                  {s.status === 'BOOKED' && (
                    <button
                      onClick={() => joinConsultation(s)}
                      className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded-lg shrink-0"
                    >
                      <FiVideo className="w-3.5 h-3.5" /> Join
                    </button>
                  )}
                </motion.div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-sm text-gray-500">No upcoming appointments</p>
                <Link to="/patient-booking" className="inline-block mt-2 text-sm font-medium text-blue-600">
                  Book appointment →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Medical records preview */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Medical Records</h2>
              <Link to="/medical-records" className="text-xs text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            <div className="p-4 space-y-2">
              {loading ? (
                <Skeleton height="3rem" />
              ) : stats.medicalRecords?.length > 0 ? (
                stats.medicalRecords.slice(0, 2).map((r) => (
                  <div key={r.id} className="p-3 border border-gray-100 rounded-lg">
                    <p className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2 mt-0.5">{r.symptoms}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No records yet</p>
              )}
            </div>
          </div>

          {/* Prescriptions preview */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-800">Prescriptions</h2>
              <Link to="/prescriptions" className="text-xs text-blue-600 hover:text-blue-700">View all</Link>
            </div>
            <div className="p-4 space-y-2">
              {loading ? (
                <Skeleton height="3rem" />
              ) : stats.prescriptions.length > 0 ? (
                stats.prescriptions.slice(0, 2).map((rx) => (
                  <div key={rx.id} className="p-3 border border-gray-100 rounded-lg">
                    <p className="text-sm font-medium text-gray-800">
                      Dr. {rx.Consultation?.Doctor?.User?.name || 'Doctor'}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{rx.diagnosis}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No prescriptions yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

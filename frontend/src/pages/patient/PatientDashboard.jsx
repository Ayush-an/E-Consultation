import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiCalendar, FiFileText, FiAlertCircle,
  FiActivity, FiClock, FiHeart, FiVideo, FiPlus,
  FiDownload, FiExternalLink, FiChevronRight
} from 'react-icons/fi';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useState, useEffect } from 'react';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [intakeComplete, setIntakeComplete] = useState(true);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalPrescriptions: 0,
    upcomingSessions: [],
    prescriptions: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const intakeRes = await fetch('/api/patients/intake-status', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const intakeData = await intakeRes.json();
      if (intakeData.status === 'success') setIntakeComplete(intakeData.data.completed);

      const dashRes = await fetch('/api/patients/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dashData = await dashRes.json();
      if (dashData.status === 'success') setStats(dashData.data);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const Stat = ({ title, value, icon: Icon }) => (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm">
      <div>
        <p className="text-xs text-gray-400 uppercase">{title}</p>
        <h3 className="text-xl font-bold">{value}</h3>
      </div>
      <Icon className="w-5 h-5 text-primary-600" />
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* Compact Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-gray-500">Manage your health & appointments</p>
        </div>
        <div className="flex gap-3">
          <Link to="/patient-booking">
            <Button size="sm" icon={FiPlus}>Book</Button>
          </Link>
          <Link to="/patient-form">
            <Button size="sm" variant="outline" icon={FiFileText}>Profile</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/patient-dashboard" className="block"><Stat title="Sessions" value={stats.totalAppointments} icon={FiCalendar} /></Link>
        <Link to="/medical-records" className="block"><Stat title="Records" value="VIEW" icon={FiFileText} /></Link>
        <Link to="/prescriptions" className="block"><Stat title="Prescriptions" value={stats.totalPrescriptions} icon={FiHeart} /></Link>
        <Stat title="Protocols" value="1" icon={FiActivity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl border shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2">
              <FiClock /> Appointments
            </h3>
            <Link to="/patient-booking" className="text-sm text-primary-600">New</Link>
          </div>

          <div className="p-4 space-y-3 max-h-[350px] overflow-y-auto">
            {stats.upcomingSessions.length > 0 ? (
              stats.upcomingSessions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-3 border rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="text-sm font-medium">
                      Dr. {s.Doctor?.User?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {s.start_time.substring(0, 5)} - {s.end_time.substring(0, 5)}
                    </p>
                  </div>

                  {s.status === 'BOOKED' ? (
                    <Button
                      size="sm"
                      icon={FiVideo}
                      onClick={() => navigate('/consultation', { state: { consultation: { slot_id: s.id, Doctor: s.Doctor } } })}
                    >
                      Join
                    </Button>
                  ) : (
                    <span className="px-3 py-1 bg-surface-100 text-surface-400 text-[10px] font-black uppercase rounded-lg">
                      {s.status}
                    </span>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="text-sm text-gray-400 text-center py-10">No appointments</p>
            )}
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-4">

          {!intakeComplete && (
            <div className="p-4 bg-yellow-100 border rounded-xl">
              <p className="text-sm font-semibold mb-2">Complete Profile</p>
              <Link to="/patient-form">
                <Button size="sm">Finish</Button>
              </Link>
            </div>
          )}

          {/* Prescriptions */}
          <div className="bg-white rounded-xl border shadow-sm">
            <div className="p-4 border-b font-semibold">Prescriptions</div>
            <div className="p-4 space-y-3">
              {stats.prescriptions.length > 0 ? (
                stats.prescriptions.slice(0, 2).map(rx => (
                  <div key={rx.id} className="p-3 border rounded-lg">
                    <p className="text-sm font-medium">Dr. {rx.Consultation?.Doctor?.User?.name}</p>
                    <p className="text-xs text-gray-500 mb-2">{rx.diagnosis}</p>
                    <button className="text-xs text-primary-600 flex items-center gap-1">
                      <FiDownload /> Download
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-400">No data</p>
              )}
            </div>
          </div>

          {/* Support */}
          <div className="p-4 bg-blue-50 border rounded-xl">
            <p className="text-sm font-semibold mb-2">Need Help?</p>
            <button className="text-sm text-primary-600 flex items-center gap-1">
              Contact <FiExternalLink />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

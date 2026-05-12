import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiEye, FiEyeOff, FiBriefcase, FiAward } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

const specializations = [
  'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist',
  'Orthopedic', 'Pediatrician', 'Psychiatrist', 'Gynecologist',
  'ENT Specialist', 'Ophthalmologist', 'Dentist', 'Other'
];

export default function DoctorCornerRegistration() {
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    specialization: '', experience: ''
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.password || form.password.length < 6) e.password = 'Min 6 chars';
    if (!form.specialization) e.specialization = 'Required';
    if (!form.experience && form.experience !== 0) e.experience = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { addToast('Please fill all fields.', 'error'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/doctor-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'success') {
        login(data.data.user, data.data.token);
        addToast('Registration successful! Welcome, Doctor.', 'success');
        navigate('/doctor');
      } else {
        console.error('Registration failed:', data);
        addToast(data.message || 'Registration failed', 'error');
      }
    } catch {
      addToast('Server communication failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const inp = (key) => `w-full bg-surface-50 border ${errors[key] ? 'border-red-400' : 'border-surface-200'} rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-surface-900 placeholder:text-surface-300 focus:outline-none focus:border-primary-500 focus:bg-white transition-all`;

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface-50">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-primary-50)_0%,_transparent_40%)]" />
        <div className="absolute inset-0 medical-grid opacity-20" />
      </div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-2xl px-6 py-20">
        <div className="bg-white rounded-[3rem] shadow-[0_32px_120px_-10px_rgba(0,0,0,0.1)] p-10 border border-surface-100">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">Doctor <span className="text-primary-600">Registration</span></h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Email */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-surface-400 tracking-widest mb-2.5 px-1">Full Name</label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                  <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp('name')} placeholder="Dr. John Doe" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-surface-400 tracking-widest mb-2.5 px-1">Personal Email</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inp('email')} placeholder="doctor@email.com" />
                </div>
              </div>
            </div>

            {/* Phone & Password */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-surface-400 tracking-widest mb-2.5 px-1">Contact Number</label>
                <div className="relative group">
                  <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                  <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inp('phone')} placeholder="9876543210" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-surface-400 tracking-widest mb-2.5 px-1">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                  <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={`${inp('password')} !pr-12`} placeholder="Min 6 characters" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-300 hover:text-primary-500 transition-colors">
                    {showPw ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Specialization & Experience */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] font-black text-surface-400 tracking-widest mb-2.5 px-1">Specialization</label>
                <div className="relative group">
                  <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                  <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} className={`${inp('specialization')} appearance-none cursor-pointer pr-10`}>
                    <option value="">Select Domain</option>
                    {specializations.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-surface-300 group-focus-within:text-primary-500 transition-colors">
                    <FiArrowRight className="rotate-90 w-4 h-4" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-surface-400 tracking-widest mb-2.5 px-1">Professional Experience (yrs)</label>
                <div className="relative group">
                  <FiAward className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                  <input type="number" min="0" max="60" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} className={inp('experience')} placeholder="Years of practice" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6">
              <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary-700 transition-all shadow-2xl hover:shadow-primary-500/30 cursor-pointer flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95">
                {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Submit Credentials</span><FiArrowRight className="w-5 h-5" /></>}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-xs font-bold text-surface-500">
              Already have an institutional account? <Link to="/doctor-corner/login" className="text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-2 decoration-primary-100 hover:decoration-primary-300 transition-all">Authenticate here</Link>
            </p>
            <div className="pt-6 border-t border-surface-50">
              <Link to="/doctor-corner" className="text-[10px] font-black text-surface-300 hover:text-primary-500 uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <FiArrowRight className="rotate-180" /> Back to Overview
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

export default function DoctorCornerLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password.trim()) {
      addToast('All fields are required.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/doctor-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.status === 'success') {
        login(data.data.user, data.data.token);
        addToast('Welcome back, Doctor!', 'success');
        navigate('/doctor');
      } else {
        addToast(data.message || 'Login failed', 'error');
      }
    } catch {
      addToast('Server communication failure.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface-50">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-primary-50)_0%,_transparent_40%)]" />
        <div className="absolute inset-0 medical-grid opacity-20" />
      </div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-md px-6 py-20">
        <div className="bg-white rounded-[3rem] shadow-[0_32px_120px_-10px_rgba(0,0,0,0.1)] p-10 border border-surface-100">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-black text-surface-900 tracking-tight">Doctor <span className="text-primary-600">Login</span></h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-surface-400 tracking-widest mb-2.5 px-1">Email</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-surface-50 border border-surface-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-surface-900 placeholder:text-surface-300 focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-sm" placeholder="doctor@econsult.com" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-surface-400 tracking-widest mb-2.5 px-1">Password</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-300 group-focus-within:text-primary-500 transition-colors" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full bg-surface-50 border border-surface-100 rounded-2xl pl-12 pr-12 py-4 text-sm font-bold text-surface-900 placeholder:text-surface-300 focus:outline-none focus:border-primary-500 focus:bg-white transition-all shadow-sm" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-300 hover:text-primary-500 transition-colors">
                  {showPw ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div className="pt-4">
              <button type="submit" disabled={loading} className="w-full bg-primary-600 text-white h-14 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary-700 transition-all shadow-2xl hover:shadow-primary-500/30 cursor-pointer flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95">
                {loading ? <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" /> : <><span>Authenticate</span><FiArrowRight className="w-5 h-5" /></>}
              </button>
            </div>
          </form>

          <div className="mt-10 text-center space-y-4">
            <p className="text-xs font-bold text-surface-500">
              New to the platform? <Link to="/doctor-corner/register" className="text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-2 decoration-primary-100 hover:decoration-primary-300 transition-all">Request Access</Link>
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

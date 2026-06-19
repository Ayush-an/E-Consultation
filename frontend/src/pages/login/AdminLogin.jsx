import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiShield } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { authApi } from '../../admin/services/adminApi';
import carelinkLogo from '../../assets/landingpage/carelink.png';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authApi.adminLogin(email, password);
      login(data.user, data.token);
      addToast('Welcome to Super Admin Portal', 'success');
      navigate('/admin');
    } catch (err) {
      addToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-4xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-2xl mb-4">
              <img src={carelinkLogo} alt="CareLink" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-white font-display">Super Admin Portal</h1>
            <p className="text-sm text-blue-200/70 mt-2">Enterprise healthcare platform management</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-blue-200/60">Email</label>
              <div className="relative mt-1">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200/40" size={16} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  placeholder="admin@carelink.com"
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-blue-200/60">Password</label>
              <div className="relative mt-1">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200/40" size={16} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25"
            >
              <FiShield size={16} />
              {loading ? 'Authenticating...' : 'Access Admin Portal'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-blue-200/40 mt-6">
          Authorized personnel only. All actions are logged.
        </p>
      </motion.div>
    </div>
  );
}

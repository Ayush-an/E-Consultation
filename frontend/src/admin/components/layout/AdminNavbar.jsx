import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiSearch, FiBell, FiMessageSquare, FiPlus, FiSettings,
  FiMenu, FiChevronDown, FiLogOut, FiUser, FiShield,
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../hooks/useToast';
import carelinkLogo from '../../../assets/landingpage/carelink.png';

export default function AdminNavbar({ onMenuClick, sidebarCollapsed }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    addToast('Admin session ended', 'info');
    navigate('/admin/login');
  };

  const notifications = [
    { id: 1, title: '3 doctors pending approval', time: '5m ago', type: 'warning' },
    { id: 2, title: 'New clinic registration', time: '12m ago', type: 'info' },
    { id: 3, title: 'Security alert detected', time: '1h ago', type: 'critical' },
  ];

  return (
    <header className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-600"
          >
            <FiMenu size={20} />
          </button>
          <div className="flex items-center gap-2.5">
            <img src={carelinkLogo} alt="CareLink" className="w-8 h-8 object-contain" />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-800 leading-none">CareLink</p>
              <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider">Super Admin</p>
            </div>
          </div>
        </div>

        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search users, clinics, doctors..."
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-colors">
            <FiPlus size={14} />
            Quick Action
          </button>

          <div className="relative">
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <FiBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-bold text-slate-800">Notifications</p>
                  </div>
                  {notifications.map((n) => (
                    <div key={n.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 cursor-pointer">
                      <p className="text-sm text-slate-700">{n.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{n.time}</p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button className="hidden sm:block p-2.5 rounded-xl hover:bg-slate-100 text-slate-600">
            <FiMessageSquare size={18} />
          </button>
          <button
            onClick={() => navigate('/admin/settings')}
            className="hidden sm:block p-2.5 rounded-xl hover:bg-slate-100 text-slate-600"
          >
            <FiSettings size={18} />
          </button>

          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-slate-500">{user?.role}</p>
              </div>
              <FiChevronDown size={14} className="text-slate-400 hidden md:block" />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                >
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    <FiUser size={16} /> Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    <FiShield size={16} /> Security
                  </button>
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FiLogOut size={16} /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}

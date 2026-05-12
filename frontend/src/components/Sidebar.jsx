import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiUsers, FiMessageSquare, FiFileText,
  FiChevronLeft, FiChevronRight, FiLogOut, FiSettings, FiClock, FiUser
} from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const menuItems = [
  { name: 'DASHBOARD', path: '/doctor', icon: FiGrid },
  { name: 'PATIENT RECORDS', path: '/doctor/patients', icon: FiUsers },
  { name: 'MY SCHEDULE', path: '/doctor/schedule', icon: FiClock },
  { name: 'SCHEDULE HISTORY', path: '/doctor/schedule-history', icon: FiClock },
  { name: 'PROFILE', path: '/doctor/profile', icon: FiUser },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user, token } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (token && user?.role === 'DOCTOR') {
      fetch('/api/doctor/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'success') setProfile(data.data);
      })
      .catch(err => console.error('Failed to fetch sidebar profile', err));
    }
  }, [token, user]);

  const doctorName = (profile?.User?.name || user?.name || 'Clinician').replace(/^(Dr\.\s*)+/i, '');
  const initials = doctorName.split(' ').map(n => n[0]).join('').substring(0, 2);

  const handleLogout = () => {
    logout();
    addToast('Institutional session terminated', 'info');
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 240 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen bg-white border-r border-surface-200 flex flex-col sticky top-0 shadow-sm overflow-hidden z-[100]"
    >
      {/* Institution Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-surface-100 bg-surface-50/50">
        <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-md shadow-primary-500/10 shrink-0">
          <FaStethoscope className="w-4.5 h-4.5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-xs font-black text-surface-900 tracking-tighter leading-none">E-CONSULT</span>
              <span className="text-[7px] font-black text-primary-600 tracking-[0.2em] uppercase mt-0.5">Institutional</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Doctor Identity Hub */}
      <div className="px-4 py-4 border-b border-surface-100">
        <div className="flex items-center gap-3 p-2.5 bg-surface-50 rounded-xl border border-surface-100">
          <div className="w-8 h-8 bg-surface-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm uppercase">
            {initials}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                 className="overflow-hidden"
              >
                <p className="text-[10px] font-black text-surface-900 uppercase tracking-tight truncate">Dr. {doctorName}</p>
                <p className="text-[8px] font-black text-surface-400 tracking-widest uppercase truncate">{profile?.specialization || 'Sr. Clinician'}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-2.5 py-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[9px] font-black tracking-widest transition-all duration-300 group
                ${isActive
                  ? 'bg-primary-600 text-white shadow-md shadow-primary-600/10'
                  : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
                }`}
            >
              <item.icon className={`w-4.5 h-4.5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-surface-400'}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap uppercase tracking-[0.1em]"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && !collapsed && (
                <motion.div
                  layoutId="sidebarActive"
                  className="ml-auto w-1 h-1 bg-white rounded-full shadow-[0_0_6px_white]"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Persistent Controls */}
      <div className="px-3 py-4 border-t border-surface-100 bg-surface-50/30">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-9 flex items-center justify-center gap-2 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-surface-400 hover:text-surface-900 hover:bg-white border border-transparent hover:border-surface-200 transition-all cursor-pointer"
        >
          {collapsed ? <FiChevronRight className="w-4 h-4" /> : <><FiChevronLeft className="w-4 h-4" /> <span>MINIMIZE</span></>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full h-9 flex items-center justify-center gap-2 px-2 mt-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-600 transition-all cursor-pointer group"
        >
          <FiLogOut className="w-4 h-4 shrink-0 group-hover:rotate-12 transition-transform" />
          {!collapsed && <span>AUTHORIZE LOGOUT</span>}
        </button>
      </div>
    </motion.aside>
  );
}



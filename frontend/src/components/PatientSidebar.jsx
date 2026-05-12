import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiCalendar, FiFileText, FiClock,
  FiChevronLeft, FiChevronRight, FiLogOut, FiUser, FiActivity, FiHeart
} from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const menuItems = [
  { name: 'DASHBOARD', path: '/patient-dashboard', icon: FiGrid },
  { name: 'BOOK APPOINTMENT', path: '/patient-booking', icon: FiCalendar },
  { name: 'HEALTH PROFILE', path: '/patient-form', icon: FiFileText },
  { name: 'MEDICAL RECORDS', path: '/medical-records', icon: FiActivity },
  { name: 'PRESCRIPTIONS', path: '/prescriptions', icon: FiHeart },
];

export default function PatientSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast('Patient session terminated', 'info');
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="h-screen bg-white border-r border-surface-200 flex flex-col sticky top-0 shadow-sm overflow-hidden z-[100]"
    >
      {/* Brand Header */}
      <div className="h-20 flex items-center gap-3 px-5 border-b border-surface-100 bg-surface-50/30">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20 shrink-0">
          <FaStethoscope className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-sm font-black text-surface-900 tracking-tighter leading-none font-display">E-CONSULT</span>
              <span className="text-[8px] font-black text-primary-600 tracking-[0.2em] uppercase mt-1">Patient Portal</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Profile Summary */}
      <div className="px-4 py-6 border-b border-surface-100">
        <div className="flex items-center gap-4 p-3 bg-primary-50/50 rounded-2xl border border-primary-100/50">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md">
            {user?.name?.charAt(0) || 'P'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="text-[11px] font-black text-surface-900 uppercase tracking-tight truncate">{user?.name || 'Patient'}</p>
                <p className="text-[8px] font-black text-primary-600 tracking-widest uppercase truncate">Verified Profile</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 group relative
                ${isActive
                  ? 'bg-primary-600 text-white shadow-xl shadow-primary-600/20'
                  : 'text-surface-500 hover:text-surface-900 hover:bg-surface-50'
                }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-surface-400'}`} />
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
                  className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_8px_white]"
                />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="px-4 py-6 border-t border-surface-100 bg-surface-50/50">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full h-10 flex items-center justify-center gap-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-surface-400 hover:text-surface-900 hover:bg-white border border-transparent hover:border-surface-200 transition-all cursor-pointer mb-2"
        >
          {collapsed ? <FiChevronRight className="w-5 h-5" /> : <><FiChevronLeft className="w-5 h-5" /> <span>MINIMIZE</span></>}
        </button>
        <button
          onClick={handleLogout}
          className="w-full h-11 flex items-center justify-center gap-3 px-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-white hover:bg-red-600 transition-all cursor-pointer group shadow-sm hover:shadow-red-500/20"
        >
          <FiLogOut className="w-5 h-5 shrink-0 group-hover:rotate-12 transition-transform" />
          {!collapsed && <span>LOGOUT</span>}
        </button>
      </div>
    </motion.aside>
  );
}

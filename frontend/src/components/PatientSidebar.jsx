import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiCalendar, FiFileText, FiChevronLeft, FiChevronRight,
  FiLogOut, FiActivity, FiHeart, FiX,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import backgroundImage from '../assets/landingpage/carelink.png';

const menuItems = [
  { name: 'Dashboard', path: '/patient-dashboard', icon: FiGrid },
  { name: 'Book Appointment', path: '/patient-booking', icon: FiCalendar },
  { name: 'Health Profile', path: '/patient-form', icon: FiFileText },
  { name: 'Medical Records', path: '/medical-records', icon: FiActivity },
  { name: 'Prescriptions', path: '/prescriptions', icon: FiHeart },
];

function SidebarContent({ collapsed, onToggle, onClose }) {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast('Logged out successfully', 'info');
    navigate('/');
    onClose?.();
  };

  const handleNav = () => onClose?.();

  return (
    <>
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <img src={backgroundImage} alt="CareLink" className="w-full h-full object-contain" />
          </div>
          {!collapsed && (
            <div>
              <p className="text-sm font-semibold text-gray-800 leading-none">CareLink</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Patient Portal</p>
            </div>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100">
            <FiX className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="px-3 py-4 border-b border-gray-100 shrink-0">
        <div className={`flex items-center gap-3 p-2.5 bg-gray-50 rounded-lg border border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{user?.name || 'Patient'}</p>
              <p className="text-xs text-gray-500">Patient account</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        {!collapsed && (
          <p className="px-3 mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-400">Menu</p>
        )}
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                onClick={handleNav}
                title={collapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    collapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 border border-blue-100'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                  }`
                }
              >
                <item.icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="px-3 py-4 border-t border-gray-200 shrink-0 space-y-1">
        {onToggle && (
          <button
            onClick={onToggle}
            className={`hidden lg:flex w-full items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          >
            {collapsed ? (
              <FiChevronRight className="w-4 h-4" />
            ) : (
              <>
                <FiChevronLeft className="w-4 h-4" />
                <span>Collapse sidebar</span>
              </>
            )}
          </button>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? 'Logout' : undefined}
        >
          <FiLogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );
}

export default function PatientSidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col h-screen bg-white border-r border-gray-200 sticky top-0 shrink-0 overflow-hidden z-30"
      >
        <SidebarContent collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </motion.aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 bg-gray-900/30 z-40"
            />
            <motion.aside
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="lg:hidden fixed left-0 top-0 h-full w-[260px] bg-white border-r border-gray-200 z-50 flex flex-col shadow-xl"
            >
              <SidebarContent collapsed={false} onClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

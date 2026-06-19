import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiChevronDown, FiLogOut } from 'react-icons/fi';
import { adminMenuSections } from '../../config/adminMenu';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../hooks/useToast';
import carelinkLogo from '../../../assets/landingpage/carelink.png';

function MenuItem({ item, collapsed, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const hasChildren = item.children?.length > 0;
  const isChildActive = hasChildren && item.children.some((c) => location.pathname === c.path);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
            isChildActive
              ? 'bg-blue-50 text-blue-700'
              : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
          }`}
        >
          {item.icon && <item.icon size={18} className="shrink-0" />}
          {!collapsed && (
            <>
              <span className="flex-1 text-left truncate">{item.name}</span>
              <FiChevronDown
                size={14}
                className={`transition-transform ${open ? 'rotate-180' : ''}`}
              />
            </>
          )}
        </button>
        <AnimatePresence>
          {open && !collapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden ml-4 mt-0.5 space-y-0.5"
            >
              {item.children.map((child) => (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                    }`
                  }
                >
                  {child.name}
                </NavLink>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      end={item.end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
          isActive
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`
      }
    >
      {item.icon && <item.icon size={18} className="shrink-0" />}
      {!collapsed && <span className="truncate">{item.name}</span>}
    </NavLink>
  );
}

function SidebarContent({ collapsed, onToggle, onMobileClose }) {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { addToast } = useToast();

  const handleLogout = () => {
    logout();
    addToast('Admin session ended', 'info');
    navigate('/admin/login');
    onMobileClose?.();
  };

  return (
    <>
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <img src={carelinkLogo} alt="" className="w-7 h-7" />
            <span className="text-sm font-bold text-slate-800">Admin Portal</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
        >
          {collapsed ? <FiChevronRight size={16} /> : <FiChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
        {adminMenuSections.map((section) => (
          <div key={section.title}>
            {!collapsed && (
              <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <div key={item.name} onClick={onMobileClose}>
                  <MenuItem item={item} collapsed={collapsed} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <FiLogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );
}

export default function AdminSidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 280 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-col fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/90 backdrop-blur-xl border-r border-slate-200/80 z-40 overflow-hidden"
      >
        <SidebarContent collapsed={collapsed} onToggle={onToggle} />
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="lg:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed left-0 top-0 h-full w-[280px] bg-white z-50 flex flex-col shadow-2xl"
            >
              <SidebarContent collapsed={false} onToggle={onToggle} onMobileClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

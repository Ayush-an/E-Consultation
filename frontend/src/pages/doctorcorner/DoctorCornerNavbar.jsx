import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowRight, FiX } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { HiMenuAlt3 } from 'react-icons/hi';

export default function DoctorCornerNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-md border-b border-surface-100'
          : 'bg-white/80 backdrop-blur-md border-b border-surface-50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-18">

          {/* LOGO */}
          <Link to="/doctor-corner" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <FaStethoscope className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black text-surface-900 tracking-tight">
                Doctor <span className="text-primary-600">Corner</span>
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-surface-400 mt-1">
                Clinical Network
              </span>
            </div>
          </Link>

          {/* NAV LINKS — Desktop */}
          <div className="hidden md:flex items-center gap-1 mx-8">
            <Link
              to="/doctor-corner"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                isActive('/doctor-corner')
                  ? 'text-primary-600 bg-primary-50'
                  : 'text-surface-600 hover:text-primary-600 hover:bg-surface-50'
              }`}
            >
              Overview
            </Link>

            <Link
              to="/"
              className="px-4 py-2 rounded-xl text-sm font-bold text-surface-600 hover:text-primary-600 hover:bg-surface-50 transition-all"
            >
              Patient Portal
            </Link>
          </div>

          {/* RIGHT SIDE — CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/doctor-corner/login"
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                isActive('/doctor-corner/login')
                  ? 'text-primary-600 bg-primary-50 ring-1 ring-primary-100'
                  : 'text-surface-700 hover:bg-surface-100'
              }`}
            >
              Sign In
            </Link>

            <Link
              to="/doctor-corner/register"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-primary-600 hover:bg-primary-700 shadow-xl hover:shadow-primary-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              Join Platform
              <FiArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-2xl bg-surface-100 text-surface-600 hover:bg-surface-200 transition-colors"
          >
            {mobileOpen ? <FiX className="w-5 h-5" /> : <HiMenuAlt3 className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-surface-100 shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-3">
              <Link
                to="/doctor-corner"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-bold text-surface-700 hover:bg-surface-50 hover:text-primary-600 transition"
              >
                Overview
              </Link>
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-4 py-3 rounded-xl text-sm font-bold text-surface-700 hover:bg-surface-50 hover:text-primary-600 transition"
              >
                Patient Portal
              </Link>

              <div className="border-t border-surface-50 pt-4 mt-4 space-y-3">
                <Link
                  to="/doctor-corner/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-bold text-surface-700 hover:bg-surface-50 transition"
                >
                  Doctor Sign In
                </Link>
                <Link
                  to="/doctor-corner/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-primary-600 hover:bg-primary-700 transition shadow-lg"
                >
                  Join the Network
                  <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

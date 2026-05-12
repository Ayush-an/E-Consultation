import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiLogIn, FiUserPlus, FiX, FiUser } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import { HiMenuAlt3 } from 'react-icons/hi';

const navLinks = [
  { name: 'Home', path: '/' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white/80 ${scrolled
        ? 'bg-white/80 backdrop-blur-xl shadow-sm border-b border-surface-200'
        : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md">
              <FaStethoscope className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-surface-900">
              E-Consult
            </span>
          </Link>



          {/* RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-4">

            {/* Patient */}
            <div className="relative group">

              {/* BUTTON */}
              <button className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl gap-1 text-sm hover:bg-primary-700 transition">
                <FiUser /> Patient
              </button>

              {/* DROPDOWN */}
              <div className="absolute right-0 top-full pt-2 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">

                <div className="bg-white rounded-xl shadow-lg border border-surface-100 overflow-hidden">
                  <Link
                    to="/patient-login"
                    className="block px-4 py-2 text-sm hover:bg-surface-50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/patient-registration"
                    className="block px-4 py-2 text-sm hover:bg-surface-50"
                  >
                    Register
                  </Link>
                </div>

              </div>
            </div>

            {/* Doctor */}
            <Link
              to="/doctor-login"
              className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm hover:bg-primary-700 transition"
            >
              Doctor Login
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg bg-surface-100"
          >
            {mobileOpen ? <FiX /> : <HiMenuAlt3 />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-t border-surface-200 shadow-lg"
          >
            <div className="p-4 space-y-3">

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm text-surface-600 hover:text-primary-600"
                >
                  {link.name}
                </Link>
              ))}

              <div className="border-t pt-3 space-y-2">
                <Link
                  to="/patient-login"
                  className="block text-sm text-surface-600"
                >
                  Patient Login
                </Link>
                <Link
                  to="/patient-registration"
                  className="block text-sm text-surface-600"
                >
                  Patient Register
                </Link>
                <Link
                  to="/doctor-login"
                  className="block text-sm text-primary-600 font-medium"
                >
                  Doctor Login
                </Link>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
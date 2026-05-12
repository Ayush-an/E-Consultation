import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone, FiArrowRight, FiShield } from 'react-icons/fi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import loginbg from '../../assets/landingpage/loginbg.jpg';

export default function PatientLogin() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone.trim()) {
      addToast('Please enter your mobile number.', 'error');
      return;
    }

    // Optional validation (Allow any 10 digits for testing)
    if (!/^\d{10}$/.test(phone)) {
      addToast('Enter a valid 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/mobile-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        login(data.data.user, data.data.token);
        addToast('Login successful', 'success');
        navigate('/patient-dashboard');
      } else {
        addToast(data.message || 'User not found', 'error');
      }
    } catch (error) {
      addToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface-900">

      {/* Background (NO BLUR) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${loginbg})` }}
      />

      {/* Optional light overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-xl bg-primary-100 text-primary-600 mb-4 shadow">
              <FiShield className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-black text-gray-700 tracking-tight">
              Patient Login
            </h1>

            <p className="text-xs text-gray-500 mt-1 font-semibold tracking-wide">
              Quick access with your mobile number
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <Input
              label="Mobile Number"
              placeholder="Enter your number"
              icon={FiPhone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full"
            >
              LOGIN
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-3">
              New here?
            </p>

            <Link to="/patient-registration">
              <Button
                variant="outline"
                className="w-full text-xs font-bold uppercase tracking-widest"
                icon={FiArrowRight}
              >
                Create Account
              </Button>
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
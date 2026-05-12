import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiPhone } from 'react-icons/fi';
import { FaStethoscope } from 'react-icons/fa';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';

export default function DoctorLogin() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone.trim()) {
      addToast('Mobile number is required.', 'error');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      addToast('Enter a valid 10-digit mobile number', 'error');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/doctor-mobile-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        login(data.data.user, data.data.token);
        addToast('Access granted.', 'success');
        navigate('/doctor');
      } else {
        addToast(data.message || 'Unauthorized access', 'error');
      }
    } catch (error) {
      addToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-surface-900">

      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('/medical_bg.png')` }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-white rounded-3xl shadow-2xl p-8">

          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-14 h-14 flex items-center justify-center rounded-xl bg-blue-100 text-blue-600 mb-4 shadow">
              <FaStethoscope className="w-6 h-6" />
            </div>

            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              Doctor Portal
            </h1>

            <p className="text-xs text-gray-500 mt-1 font-semibold tracking-wide">
              Login with your registered mobile number
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
          <div className="mt-6 text-center">
            <p className="text-[11px] text-gray-400 font-medium">
              Authorized medical personnel only
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiPhone, FiCalendar, FiArrowRight, FiShield, FiUserPlus } from 'react-icons/fi';
import Input from '../../components/Input';
import Button from '../../components/Button';

const initialForm = {
  fullName: '',
  dob: '',
  phone: '',
  gender: ''
};

export default function PatientRegistration() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { login } = useAuth();

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Required';
    if (!form.dob.trim()) e.dob = 'Required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (!form.gender) e.gender = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please fill all required fields correctly.', 'error');
      return;
    }
    setLoading(true);
    addToast('Contacting clinical server...', 'info');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.fullName,
          phone: form.phone,
          dob: form.dob,
          role: 'PATIENT',
          gender: form.gender
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        login(data.data.user, data.data.token);
        addToast('Registration successful!', 'success');
        navigate('/patient-dashboard');
      } else {
        addToast(data.message || 'Registration failed', 'error');
      }
    } catch (error) {
      addToast('An error occurred during registration', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6 relative overflow-hidden medical-grid">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/5 blur-[100px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-4xl border border-surface-200 shadow-premium p-8 sm:p-10 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-50 text-primary-600 mb-4 shadow-sm border border-primary-100">
            <FiShield className="w-6 h-6" />
          </div>
          <div className="inline-block px-3 py-1 bg-surface-50 rounded-full border border-surface-200 text-[8px] font-black text-surface-400 uppercase tracking-[0.2em] mb-3">
            Secure Patient Registration Protocol
          </div>
          <h1 className="text-2xl font-black text-surface-900 mb-2 font-display uppercase tracking-tight">
            Create Account <span className="gradient-text">For Free</span>
          </h1>
          <p className="text-xs text-surface-500 font-bold uppercase tracking-widest">Join our digital healthcare platform.</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <Input
            label="Full Name *"
            placeholder="ENTER LEGAL NAME"
            icon={FiUser}
            value={form.fullName}
            onChange={(e) => update('fullName', e.target.value)}
            error={errors.fullName}
            className="font-bold uppercase text-xs"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Date of Birth *"
              type="date"
              icon={FiCalendar}
              value={form.dob}
              onChange={(e) => update('dob', e.target.value)}
              error={errors.dob}
              className="font-bold uppercase text-xs"
            />
            <Input
              label="Phone Number *"
              placeholder="+1..."
              icon={FiPhone}
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              error={errors.phone}
              className="font-bold uppercase text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">Gender *</label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-600 transition-colors">
                <FiUserPlus className="w-4 h-4" />
              </div>
              <select
                value={form.gender}
                onChange={(e) => update('gender', e.target.value)}
                className={`w-full pl-11 pr-4 py-3 bg-surface-50 border ${errors.gender ? 'border-red-500' : 'border-surface-200'} rounded-2xl text-xs font-bold uppercase focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 transition-all appearance-none cursor-pointer`}
              >
                <option value="">SELECT GENDER</option>
                <option value="MALE">MALE</option>
                <option value="FEMALE">FEMALE</option>
                <option value="OTHER">OTHER</option>
              </select>
              {errors.gender && <p className="text-[10px] text-red-500 mt-1 ml-1 font-bold">{errors.gender}</p>}
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-6 shadow-lg shadow-primary-500/20"
          >
            CREATE ACCOUNT
          </Button>
        </form>

        <div className="mt-8 text-center border-t border-surface-100 pt-6">
          <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">
            Already registered?{' '}
            <Link to="/patient-login" className="text-primary-600 hover:text-primary-700 transition-colors inline-flex items-center gap-1 group">
              Login here
              <FiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

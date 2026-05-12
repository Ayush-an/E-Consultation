import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiUser, FiPhone, FiMail, FiMapPin, FiHeart, FiFileText,
  FiAlertCircle, FiChevronLeft, FiChevronRight, FiSend, FiUpload, FiX, FiPlus, FiCheckCircle
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../context/AuthContext';
import { diseases } from '../../utils/mockData';
import { useEffect } from 'react';

const stepLabels = ['Identity', 'History', 'Complaint'];

const initialForm = {
  name: '', age: '', gender: '', phone: '', email: '',
  address: '', city: '', state: '', country: '',
  diseases: [], allergies: '', medications: '', surgeries: '',
  familyHistory: '', reports: [],
  symptoms: '', duration: '', severity: 'Low', notes: '',
};

export default function PatientForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { token, user: authUser } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const calculateAge = (dobString) => {
    if (!dobString) return '';
    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/patients/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') {
        const u = data.data;
        const p = u.Patient;
        setForm(prev => ({
          ...prev,
          name: u.name || '',
          phone: u.phone || '',
          email: u.email || '',
          gender: p?.gender === 'MALE' ? 'Male' : p?.gender === 'FEMALE' ? 'Female' : p?.gender === 'OTHER' ? 'Other' : '',
          age: p?.dob ? calculateAge(p.dob) : '',
          address: p?.address || ''
        }));
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleDisease = (d) => {
    setForm((prev) => ({
      ...prev,
      diseases: prev.diseases.includes(d)
        ? prev.diseases.filter((x) => x !== d)
        : [...prev.diseases, d],
    }));
  };

  const addReport = () => {
    const timestamp = Date.now();
    const name = `DOC-SCAN-${timestamp}.pdf`;
    const mockUrl = `https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf`; // Sample PDF
    setForm((prev) => ({ 
      ...prev, 
      reports: [...prev.reports, { name, url: mockUrl }] 
    }));
    addToast('File securely uploaded.', 'success');
  };

  const removeReport = (index) => {
    setForm((prev) => ({
      ...prev,
      reports: prev.reports.filter((_, i) => i !== index),
    }));
  };

  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.age || isNaN(form.age) || form.age < 1) e.age = 'Invalid age';
    if (!form.gender) e.gender = 'Selection required';
    if (!form.phone.trim()) e.phone = 'Contact required';
    // Email is optional
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (!form.symptoms.trim()) e.symptoms = 'Description required';
    if (!form.duration.trim()) e.duration = 'Duration required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 1 && !validateStep1()) {
      addToast('Mandatory fields missing.', 'error');
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 1));

  const submit = async () => {
    if (!validateStep3()) {
      addToast('Details missing.', 'error');
      return;
    }
    setLoading(true);
    addToast('Processing digital intake...', 'info');

    try {
      const response = await fetch('/api/patients/intake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          symptoms: form.symptoms,
          history: JSON.stringify({
            diseases: form.diseases,
            allergies: form.allergies,
            medications: form.medications,
            surgeries: form.surgeries,
            familyHistory: form.familyHistory
          }),
          age: form.age,
          gender: form.gender.toUpperCase(),
          address: form.address,
          reports: form.reports
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        addToast('Intake session synchronized.', 'success');
        setTimeout(() => navigate('/patient-dashboard'), 1500);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      addToast('Sync failed: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const [direction, setDirection] = useState(1);
  const handleNext = () => { setDirection(1); next(); };
  const handlePrev = () => { setDirection(-1); prev(); };

  return (
    <div className="pb-20 px-4 sm:px-6 relative w-full">
      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative text-center mb-5"
        >
          <button
            onClick={() => navigate('/patient-dashboard')}
            className="absolute left-0 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-white border border-surface-200 text-surface-400 hover:text-primary-600 hover:border-primary-200 transition-all flex items-center shadow-sm group"
          >
            <FiChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <h1 className="text-2xl sm:text-3xl font-black text-surface-900 mb-2 font-display">
            Patient <span className="gradient-text">History Form</span>
          </h1>
        </motion.div>

        {/* Form Container */}
        <div className="bg-white rounded-3xl border border-surface-200 shadow-premium overflow-hidden">
          {/* Progress Header */}
          <div className="bg-surface-50 border-b border-surface-100 p-10 sm:p-5">
            <div className="flex items-center justify-between">
              {stepLabels.map((label, i) => (
                <div key={label} className="flex flex-col items-center gap-2 relative z-10">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-[11px] transition-all duration-500 ${step > i + 1 ? 'bg-secondary-600 text-white shadow-md shadow-secondary-500/10' :
                    step === i + 1 ? 'bg-primary-600 text-white shadow-md shadow-primary-500/10' :
                      'bg-white text-surface-300 border border-surface-200'
                    }`}>
                    {step > i + 1 ? <FiCheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`text-[8px] font-black tracking-widest uppercase ${step === i + 1 ? 'text-primary-600' : 'text-surface-400'
                    }`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Form Area */}
          <div className="relative">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 sm:p-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="col-span-1 md:col-span-6">
                      <Input
                        label="FULL LEGAL NAME"
                        placeholder="e.g. Rahul Sharma"
                        icon={FiUser}
                        required
                        value={form.name}
                        onChange={(e) => update('name', e.target.value)}
                        error={errors.name}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <Input
                        label="AGE"
                        placeholder="YY"
                        type="number"
                        required
                        value={form.age}
                        onChange={(e) => update('age', e.target.value)}
                        error={errors.age}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-4">
                      <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1.5 ml-1">GENDER *</label>
                      <select
                        value={form.gender}
                        onChange={(e) => update('gender', e.target.value)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-xs font-bold leading-none bg-surface-50 transition-all focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600
                          ${errors.gender ? 'border-red-400' : 'border-surface-200 hover:border-surface-300'}`}
                      >
                        <option value="">SELECT</option>
                        <option value="Male">MALE</option>
                        <option value="Female">FEMALE</option>
                        <option value="Other">OTHER</option>
                      </select>
                    </div>
                    <div className="col-span-1 md:col-span-6">
                      <Input
                        label="CONTACT NUMBER"
                        placeholder="+91"
                        icon={FiPhone}
                        required
                        value={form.phone}
                        onChange={(e) => update('phone', e.target.value)}
                        error={errors.phone}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-6">
                      <Input
                        label="EMAIL ADDRESS"
                        placeholder="you@hospital.com"
                        type="email"
                        icon={FiMail}
                        value={form.email}
                        onChange={(e) => update('email', e.target.value)}
                        error={errors.email}
                      />
                    </div>
                    <div className="col-span-1 md:col-span-12">
                      <Input
                        label="RESIDENTIAL ADDRESS"
                        placeholder="Street, Building, Flat"
                        icon={FiMapPin}
                        value={form.address}
                        onChange={(e) => update('address', e.target.value)}
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 sm:p-8"
                >
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3">CHRONIC CONDITIONS</label>
                      <div className="flex flex-wrap gap-1.5">
                        {diseases.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDisease(d)}
                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all duration-300 cursor-pointer
                              ${form.diseases.includes(d)
                                ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                                : 'bg-white text-surface-500 border-surface-200 hover:border-primary-200 hover:text-primary-600'
                              }`}
                          >
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <Input
                        label="ALLERGIES"
                        placeholder="Allergens..."
                        value={form.allergies}
                        onChange={(e) => update('allergies', e.target.value)}
                      />
                      <Input
                        label="MEDICATIONS"
                        placeholder="Metformin, etc."
                        icon={GiPill}
                        value={form.medications}
                        onChange={(e) => update('medications', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-2 ml-1">CLINICAL HISTORY</label>
                      <textarea
                        rows={2}
                        placeholder="Genetic or hereditary conditions..."
                        value={form.familyHistory}
                        onChange={(e) => update('familyHistory', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-surface-200 bg-surface-50 text-xs font-bold leading-normal placeholder:text-surface-400 transition-all focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 resize-none"
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      {form.reports.map((file, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 bg-surface-50 rounded-xl border border-surface-100 group animate-in slide-in-from-left-2 shadow-sm">
                          <FiFileText className="w-3.5 h-3.5 text-primary-500" />
                          <span className="text-[10px] font-bold text-surface-700 flex-1 truncate">{file.name}</span>
                          <button onClick={() => removeReport(i)} className="text-surface-300 hover:text-red-500 transition-colors cursor-pointer p-1">
                            <FiX className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={addReport}
                        className="sm:col-span-2 border border-dashed border-primary-200 rounded-xl py-2 text-center cursor-pointer hover:bg-primary-50 transition-all group flex items-center justify-center gap-2"
                      >
                        <FiUpload className="w-3.5 h-3.5 text-primary-400 group-hover:text-primary-600" />
                        <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest">Upload Lab Reports</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -50 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="p-8 sm:p-12"
                >
                  <div className="space-y-8">
                    <div>
                      <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-3">Describe your symptoms </label>
                      <textarea
                        rows={4}
                        placeholder="Describe your current symptoms and when they started..."
                        value={form.symptoms}
                        onChange={(e) => update('symptoms', e.target.value)}
                        className={`w-full px-6 py-4 rounded-[1.5rem] border bg-surface-50 text-sm font-bold placeholder:text-surface-400 transition-all focus:outline-none focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 resize-none
                          ${errors.symptoms ? 'border-red-400' : 'border-surface-200 hover:border-surface-300'}`}
                      />
                      {errors.symptoms && <p className="mt-2 text-xs font-bold text-red-500 uppercase tracking-widest">{errors.symptoms}</p>}
                    </div>

                    <Input
                      label="SYMPTOM DURATION"
                      placeholder="e.g. 5 days"
                      required
                      value={form.duration}
                      onChange={(e) => update('duration', e.target.value)}
                      error={errors.duration}
                      className="font-bold uppercase"
                    />

                    <div>
                      <label className="block text-[10px] font-black text-surface-400 uppercase tracking-widest mb-4">CLINICAL SEVERITY</label>
                      <div className="flex gap-4">
                        {['Low', 'Medium', 'High'].map((level) => {
                          const colors = {
                            Low: 'border-secondary-600 bg-secondary-50 text-secondary-700',
                            Medium: 'border-amber-500 bg-amber-50 text-amber-700',
                            High: 'border-red-500 bg-red-50 text-red-700',
                          };
                          return (
                            <button
                              key={level}
                              type="button"
                              onClick={() => update('severity', level)}
                              className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-300 cursor-pointer shadow-sm
                                ${form.severity === level
                                  ? colors[level]
                                  : 'border-surface-200 text-surface-400 hover:border-surface-300'
                                }`}
                            >
                              {level}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Hub */}
          <div className="px-4 sm:px-5 py-6 bg-surface-50 border-t border-surface-100 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={handlePrev}
              disabled={step === 1}
              icon={FiChevronLeft}
              className="px-4"
              size="md"
            >
              PREV
            </Button>

            {step < 3 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                icon={FiChevronRight}
                size="lg"
                className="px-8 font-black tracking-widest"
              >
                NEXT STAGE
              </Button>
            ) : (
              <Button
                variant="secondary"
                onClick={submit}
                loading={loading}
                icon={FiSend}
                size="lg"
                className="flex-1 font-black tracking-widest shadow-lg shadow-secondary-500/10"
              >
                START SESSION
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



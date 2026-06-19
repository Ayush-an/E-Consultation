// pages/Home.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiShield, FiVideo, FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiLinkedin,
  FiActivity, FiPhone, FiMail, FiMapPin, FiPlus, FiUser, FiHeart, FiAward, FiClock,
} from 'react-icons/fi';
import { FaStethoscope, FaUserMd } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import ProcessCapsule from '../components/ProcessCapsule';

import Homeimg from '../assets/landingpage/image.png';
import capsulebg from '../assets/landingpage/capsulebg.jpg';

import backgroundImage from '../assets/landingpage/carelink.png';

const stats = [
  { value: '25K+', label: 'Patients Served' },
  { value: '1.2K+', label: 'Verified Doctors' },
  { value: '4.95', label: 'Trust Score' },
  { value: '100%', label: 'Secure Reports' },
];
export default function Home() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  // Registration State
  const [regForm, setRegForm] = useState({ fullName: '', dob: '', phone: '', gender: '' });
  const [regLoading, setRegLoading] = useState(false);

  // Contact State
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '', mobile: '' });
  const [contactLoading, setContactLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!regForm.fullName.trim()) e.fullName = 'Name is required';
    if (!regForm.phone.trim()) e.phone = 'Mobile is required';
    if (!regForm.dob.trim()) e.dob = 'DOB is required';
    if (!regForm.gender) e.gender = 'Gender is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validate()) {
      addToast('Please fill all clinical required fields.', 'error');
      return;
    }

    setRegLoading(true);
    addToast('Synchronizing with medical server...', 'info');

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regForm.fullName,
          phone: regForm.phone,
          dob: regForm.dob,
          role: 'PATIENT',
          gender: regForm.gender
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
      console.error('Registration Error:', error);
      addToast('Medical server communication failure.', 'error');
    } finally {
      setRegLoading(false);
    }
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      addToast('Mandatory fields missing.', 'error');
      return;
    }
    setContactLoading(true);
    setTimeout(() => {
      setContactLoading(false);
      addToast('Transmission successful. A clinical officer will respond.', 'success');
      setContactForm({ name: '', email: '', subject: '', message: '', mobile: '' });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-surface-50 selection:bg-primary-100 selection:text-primary-900">
      {/* HERO SECTION */}
      <section className="relative pt-8 lg:pt-10 lg:min-h-[90vh] flex items-center overflow-hidden bg-white">
        {/* Subtle Background Accent */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50/50 skew-x-[-12deg] translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/4 right-1/4 w-[40rem] h-[40rem] bg-primary-100/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center py-8 lg:py-12">

            {/* Left Content */}
            <div className="flex flex-col items-start">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-primary-600 font-bold text-[10px] uppercase tracking-[0.3em] mb-4"
              >
                Join the Network of 1,200+ Verified Doctors
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl sm:text-5xl xl:text-6xl font-bold text-gray-600 leading-none mb-6 font-display uppercase tracking-tight"
              >
                Clinical <span className="text-primary-600">Precision</span> <br />
                <span className="text-gray-600">Digitally Defined.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-sm xl:text-base text-surface-600 max-w-lg mb-6 leading-relaxed font-medium tracking-wide opacity-80"
              >
                Access synchronized medical care. Professional consultations, secure EHR integration, and digital prescriptions in a high-performance clinical environment.
              </motion.p>
              {/* Minimal Stats Bar */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-10 mt-16 pt-10 border-t border-surface-100 w-full"
              >
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-bold text-surface-900 mb-1">{stat.value}</div>
                    <div className="text-[10px] text-surface-400 font-bold uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right — Tablet Mockup Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block"
            >
              {/* Tablet Frame */}
              <div className="relative mx-auto w-full max-w-[420px] aspect-[3/4.2] bg-slate-900 rounded-[3rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.25)] border-[6px] border-slate-800">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-slate-800 rounded-b-2xl z-20" />

                {/* Tablet Content (The "Screen") */}
                <div className="w-full h-full bg-white rounded-[2rem] overflow-hidden relative">
                  {/* Dashboard Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-center bg-slate-50/50">
                    <div className="flex justify-center">
                      <div>
                        <p className="text-[25px] text-primary-600 text-center font-bold uppercase tracking-wider">Free Registration</p>
                      </div>
                    </div>

                  </div>

                  {/* Dashboard Body */}
                  <div className="p-6 space-y-6">

                    <form onSubmit={handleRegister} className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[12px] font-black text-gray-800 text-surface-400 tracking-widest mb-2">Name</label>
                          <input
                            type="text"
                            value={regForm.fullName}
                            onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                            className={`w-full bg-surface-50 border ${errors.fullName ? 'border-red-500' : 'border-surface-100'} rounded-xl px-4 h-11 text-xs font-bold text-surface-900 placeholder:text-surface-300 focus:outline-none focus:border-primary-500 focus:bg-white transition-all tracking-wider`}
                            placeholder="Enter Your Name"
                          />
                          {errors.fullName && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.fullName}</p>}
                        </div>
                        <div>
                          <label className="block text-[12px] font-black text-gray-800 text-surface-400 tracking-widest mb-2">Gender</label>
                          <select
                            value={regForm.gender}
                            onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                            className={`w-full bg-surface-50 border ${errors.gender ? 'border-red-500' : 'border-surface-100'} rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-primary-500 focus:bg-white transition-all tracking-wider appearance-none cursor-pointer`}
                          >
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                          {errors.gender && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.gender}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[12px] font-black text-gray-800 text-surface-400 tracking-widest mb-2">Date of Birth</label>
                          <input
                            type="date"
                            value={regForm.dob}
                            onChange={(e) => setRegForm({ ...regForm, dob: e.target.value })}
                            className={`w-full bg-surface-50 border ${errors.dob ? 'border-red-500' : 'border-surface-100'} rounded-xl px-4 py-3 text-xs font-bold text-surface-600 focus:outline-none focus:border-primary-500 focus:bg-white transition-all`}
                          />
                          {errors.dob && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.dob}</p>}
                        </div>
                        <div>
                          <label className="block text-[12px] font-black text-gray-800 text-surface-400 tracking-widest mb-2">Mobile Number</label>
                          <input
                            type="tel"
                            value={regForm.phone}
                            onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                            className={`w-full bg-surface-50 border ${errors.phone ? 'border-red-500' : 'border-surface-100'} rounded-xl px-4 py-3 text-xs font-bold text-surface-900 placeholder:text-surface-300 focus:outline-none focus:border-primary-500 focus:bg-white transition-all uppercase tracking-widest`}
                            placeholder="+91..."
                          />
                          {errors.phone && <p className="text-[9px] text-red-500 mt-1 font-bold">{errors.phone}</p>}
                        </div>
                      </div>

                      <div className="pt-3">
                        <button
                          type="submit"
                          disabled={regLoading}
                          className="w-full bg-gray-700 text-white h-10 rounded-3xl text-[11px] font-black uppercase tracking-[0.3em] hover:bg-primary-700 transition-all shadow-xl cursor-pointer flex items-center justify-center gap-3 transform hover:-translate-y-1 active:scale-95"
                        >
                          {regLoading ? <div className="w-4 h-4 border-2 border-surface-900 border-t-transparent rounded-full animate-spin" /> : (
                            <>
                              Register
                              <FiArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {/* Chart Mockup */}
                    <div className="pt-2">
                      <div className="h-24 w-full bg-slate-50 rounded-2xl flex items-end justify-between px-4 py-2 gap-1 border border-slate-100">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                          <div key={i} className="w-full bg-primary-200 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                    </div>
                    {/* Feature Bars Section (After Form) */}
                    <div className="grid sm:grid-cols-2 gap-1 mt-3">
                      {[
                        'Medical Advice',
                        '24/7 Emergency'
                      ].map((item, i) => (
                        <div
                          key={i}
                          className="bg-gray-700 text-white h-12 rounded-2xl flex items-center justify-center text-xs font-bold uppercase tracking-wider shadow-md"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Blur Orbs */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-200/40 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-secondary-200/30 rounded-full blur-3xl pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Infrastructure Features Section */}
      <section className="py-5 pt-10 bg-white border-b border-surface-100 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-2">
            <div className="max-w-xl">
              <h2 className="text-4xl font-black text-surface-900 font-display uppercase tracking-tight leading-none mb-4">Clinical <span className="text-primary-600">Infrastructure</span></h2>
              <p className="text-surface-500 text-sm font-medium leading-relaxed max-w-lg">Secure and reliable infrastructure for all our clinical needs.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: FiShield, title: 'Secure Register', desc: 'Securly Register your Medical Records.', color: 'bg-primary-50 text-primary-600 hover:bg-primary-600' },
              { icon: FiVideo, title: 'HD One to one Screening', desc: 'Live one to one interaction of Doctor and patient.', color: 'bg-secondary-50 text-secondary-600 hover:bg-secondary-600' },
              { icon: FiActivity, title: 'Digital Prescription', desc: 'Standard Digital Prescription is provided.', color: 'bg-primary-50 text-primary-600 hover:bg-primary-600' }
            ].map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="group p-6 rounded-2xl bg-surface-50 border border-surface-100 transition-all duration-500 hover:bg-white hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)]"
              >
                <div className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:text-white`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-surface-900 mb-3 uppercase tracking-tight">{f.title}</h3>
                <p className="text-xs text-surface-500 font-medium leading-relaxed opacity-70">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Operational Workflow Section */}
      <section className="relative pt-5 py-6 overflow-hidden text-center">

        {/* BACKGROUND IMAGE */}
        <div className="absolute inset-0 z-0">
          <img
            src={capsulebg}
            alt="Workflow Background"
            className="w-full h-full object-cover"
          />

          {/* OVERLAY (important for text visibility) */}
          <div className="absolute inset-0 bg-white/80" />
        </div>

        {/* CONTENT */}
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-surface-900 font-display uppercase tracking-tight mb-4">
              Easyest <span className="text-primary-600">Workflow</span>
            </h2>
            <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.4em]">
              Patient Journey in simply 4 easy steps
            </p>
          </div>

          <ProcessCapsule />
        </div>
      </section>

      {/* About Section - Integrated */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="aspect-[4/4] rounded-5xl bg-surface-50 border border-surface-100 overflow-hidden relative group shadow-inner">
                <img src={Homeimg} className="w-full h-full object-cover" alt="Consultation Illustration" />
                <div className="absolute inset-0 bg-linear-to-br from-primary-600/5 to-secondary-600/5" />
                <div className="absolute bottom-5 left-5 right-5 p-6 bg-white/50 backdrop-blur-md rounded-4xl border border-white/50 shadow-lg">
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Clinical Standard</p>
                  <p className="text-xl font-black text-surface-900 italic">Zero Compromise Precision</p>
                </div>
              </div>
            </motion.div>

            <div>
              <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-widest mb-6">Our Trust</div>
              <h2 className="text-4xl font-black text-surface-900 font-display uppercase tracking-tight leading-tight mb-8">
                The Site of <br /><span className="text-primary-600">Trust & Global Excellence</span>
              </h2>
              <p className="text-surface-600 text-sm font-medium leading-relaxed mb-10 tracking-wide">
                Built on clinical binary precision and institutional security led by a panel of vetted medical specialists.
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { icon: FiHeart, title: 'Patient Centric', desc: 'Welfare as core priority.' },
                  { icon: FiShield, title: 'Sovereign Secure', desc: 'Absolute data privacy.' },
                ].map((v, i) => (
                  <div key={i} className="p-5 rounded-2xl border border-surface-100 bg-surface-50">
                    <v.icon className="w-5 h-5 text-primary-500 mb-4" />
                    <h4 className="text-[14px] font-black text-surface-900 uppercase tracking-tight mb-1">{v.title}</h4>
                    <p className="text-[12px] text-surface-500 font-bold">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 bg-linear-to-b from-white to-surface-50 relative overflow-hidden">

        {/* Background Glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary-500/10 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto px-6 relative z-10">

          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-surface-900 mb-3">
              Get in <span className="text-primary-600">Touch</span>
            </h2>
            <p className="text-surface-500 text-sm">
              We’re here to help you with your medical queries
            </p>
          </div>

          {/* Main Card */}
          <div className="grid lg:grid-cols-2 bg-white rounded-4xl shadow-2xl overflow-hidden border border-surface-100">

            {/* LEFT - INFO */}
            <div className="p-10 bg-gray-600 text-white flex flex-col justify-center">
              <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>

              <div className="space-y-6">
                {contactInfo.map((info, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                      <info.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs opacity-70">{info.title}</p>
                      <p className="text-sm font-medium">{info.info}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT - FORM */}
            <div className="p-10">
              <form onSubmit={handleContactSubmit} className="space-y-5">

                <div className="grid sm:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="Full name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full border border-surface-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-primary-500"
                  />

                  <input
                    type="tel"
                    placeholder="Mobile number"
                    value={contactForm.mobile}
                    onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                    className="w-full border border-surface-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-primary-500"
                  />
                </div>

                <input
                  type="text"
                  placeholder="Subject"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  className="w-full border border-surface-200 rounded-xl px-4 h-12 text-sm focus:outline-none focus:border-primary-500"
                />

                <textarea
                  rows={4}
                  placeholder="Write your message..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full border border-surface-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-500 resize-none"
                />

                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full bg-primary-600 text-white h-12 rounded-xl text-sm font-semibold hover:bg-primary-700 transition"
                >
                  {contactLoading ? "Sending..." : "Send Message"}
                </button>

              </form>
            </div>

          </div>
        </div>
      </section>

      {/* MODERN FOOTER */}
      <footer className="bg-surface-900 text-white pt-20 pb-10 relative overflow-hidden">

        {/* Subtle Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary-600/20 blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">

          {/* TOP GRID */}
          <div className="grid lg:grid-cols-4 gap-12 mb-16">

            {/* BRAND */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-5">
                 <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-md">
                              <img src={backgroundImage} alt="Logo" className="w-14 h-14" />
                            </div>
                            <span className="text-xl font-semibold text-primary-600">
                              CareLink
                            </span>
              </div>

              <p className="text-surface-300 text-sm leading-relaxed max-w-md">
                Digital healthcare platform delivering seamless consultations,
                secure medical records, and trusted clinical services — all in one place.
              </p>

              {/* Socials */}
              <div className="flex gap-3 mt-6">
                {[
                  { icon: FiInstagram, link: "#" },
                  { icon: FiFacebook, link: "#" },
                  { icon: FiTwitter, link: "#" },
                  { icon: FiYoutube, link: "#" },
                  { icon: FiLinkedin, link: "#" },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={i}
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center 
                   hover:bg-primary-600 transition-all duration-300 
                   hover:scale-110 hover:shadow-lg"
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* LINKS */}
            <div>
              <h4 className="text-sm font-semibold mb-5 text-white">Services</h4>
              <ul className="space-y-3">
                {['Consultations', 'Digital Prescription', 'Diagnostics', 'Health Records'].map((l) => (
                  <li key={l}>
                    <a href="#" className="text-surface-400 text-sm hover:text-primary-400 transition">
                      {l}
                    </a>
                  </li>
                ))}
                <li>
                  <Link to="/doctor-corner" className="text-surface-400 text-sm hover:text-primary-400 transition flex items-center gap-1.5">
                    <FaUserMd className="w-3.5 h-3.5 text-primary-400" />
                    Doctor Corner
                  </Link>
                </li>
                <li>
                  <Link to="/admin/login" className="text-surface-400 text-sm hover:text-primary-400 transition flex items-center gap-1.5">
                    <FiShield className="w-3.5 h-3.5 text-primary-400" />
                    Admin
                  </Link>
                </li>
              </ul>
            </div>

            {/* CONTACT */}
            <div>
              <h4 className="text-sm font-semibold mb-5 text-white">Contact</h4>

              <div className="space-y-4 text-sm text-surface-400">

                <div className="flex items-center gap-3">
                  <FiMapPin className="w-4 h-4 text-primary-400" />
                  <span>Pune, Maharashtra, India</span>
                </div>

                <div className="flex items-center gap-3">
                  <FiPhone className="w-4 h-4 text-primary-400" />
                  <span>+91 1800 123 4567</span>
                </div>

                <div className="flex items-center gap-3">
                  <FiMail className="w-4 h-4 text-primary-400" />
                  <span>support@econsult.com</span>
                </div>

              </div>
            </div>

          </div>

          {/* DIVIDER */}
          <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">

            <p className="text-surface-500 text-sm">
              © 2026 E-Consult Platform. All rights reserved.
            </p>

            <div className="flex gap-6 text-sm text-surface-400">
              {['Privacy Policy', 'Terms', 'Security'].map((l) => (
                <a key={l} href="#" className="hover:text-primary-400 transition">
                  {l}
                </a>
              ))}
              <Link to="/admin/login" className="hover:text-primary-400 transition flex items-center gap-1">
                <FiShield className="w-3.5 h-3.5" /> Admin
              </Link>
            </div>

          </div>

        </div>
      </footer>    </div>
  );
}

const contactInfo = [
  { icon: FiPhone, title: 'CLINICAL HELPLINE', info: '+91 1800 123 4567', sub: '24/7 EMERGENCY TRIAGE', color: 'from-primary-600 to-primary-800' },
  { icon: FiMail, title: 'SECURE EMAIL', info: 'abc@econsult.medical', sub: 'ENCRYPTED TRANSMISSION', color: 'from-secondary-600 to-secondary-800' },
  { icon: FiMapPin, title: 'HEADQUARTERS', info: 'Baner Complex, Pune.', sub: 'PUNE, MAHARASHTRA, INDIA', color: 'from-surface-700 to-surface-900' },
  { icon: FiClock, title: 'OPERATIONAL HOURS', info: 'MON - SAT: 09:00-20:00', sub: 'STANDARD CLINICAL TIME', color: 'from-primary-500 to-secondary-500' },
];

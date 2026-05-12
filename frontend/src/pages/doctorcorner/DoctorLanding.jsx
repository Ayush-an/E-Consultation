import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FiArrowRight, FiShield, FiDollarSign, FiClock, FiFileText,
  FiVideo, FiUsers, FiAward, FiTrendingUp, FiCheckCircle,
} from 'react-icons/fi';
import { FaStethoscope, FaUserMd, } from 'react-icons/fa';

const stats = [
  { value: '1.2K+', label: 'Doctors Enrolled', icon: FaUserMd },
  { value: '25K+', label: 'Consultations', icon: FiVideo },
  { value: '4.95', label: 'Platform Rating', icon: FiAward },
  { value: '24/7', label: 'Support', icon: FiClock },
];

const benefits = [
  {
    icon: FiDollarSign,
    title: 'Maximize Earnings',
    desc: 'Set your own consultation fees and availability. Earn more with digital consultations and zero overhead.',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    icon: FiClock,
    title: 'Flexible Schedule',
    desc: 'Define your own time slots. Practice from anywhere — home, clinic, or on the go.',
    color: 'from-primary-500 to-primary-700',
  },
  {
    icon: FiFileText,
    title: 'Digital Prescriptions',
    desc: 'Generate professional, tamper-proof digital prescriptions instantly after consultations.',
    color: 'from-violet-500 to-purple-700',
  },
  {
    icon: FiShield,
    title: 'Secure EHR Access',
    desc: 'Access complete patient histories with enterprise-grade encryption and HIPAA-compliant security.',
    color: 'from-blue-500 to-indigo-700',
  },
  {
    icon: FiVideo,
    title: 'HD Video Consults',
    desc: 'Crystal-clear WebRTC video calls with screen sharing, file transfer, and live annotations.',
    color: 'from-rose-500 to-pink-700',
  },
  {
    icon: FiUsers,
    title: 'Patient Network',
    desc: 'Get matched with patients looking for your specialization. Grow your practice effortlessly.',
    color: 'from-amber-500 to-orange-600',
  },
];

const steps = [
  { step: '01', title: 'Register', desc: 'Create your doctor profile with credentials and specialization.' },
  { step: '02', title: 'Setup Profile', desc: 'Add your availability slots, fees, and clinic details.' },
  { step: '03', title: 'Start Consulting', desc: 'Receive bookings and conduct HD video consultations.' },
  { step: '04', title: 'Earn & Grow', desc: 'Get paid instantly and build your digital reputation.' },
];

export default function DoctorLanding() {
  return (
    <div className="min-h-screen bg-white selection:bg-primary-100 selection:text-primary-900">

      {/* HERO SECTION */}
      <section className="relative pt-16 lg:pt-20 lg:min-h-[90vh] flex items-center overflow-hidden bg-white">
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl sm:text-6xl xl:text-7xl font-bold text-slate-900 leading-[1.1] mb-8 font-display tracking-tight"
              >
                Elevate Your <br />
                <span className="text-primary-600">Practice.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg xl:text-xl text-slate-500 max-w-lg mb-10 leading-relaxed font-medium"
              >
                The complete digital workspace for modern doctors.
                Experience seamless patient management and secure consultations.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap gap-4"
              >
                <Link
                  to="/doctor-corner/register"
                  className="bg-primary-600 text-white px-10 py-4 rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-primary-500/20"
                >
                  Get Started for Free
                </Link>
                <Link
                  to="/doctor-corner/login"
                  className="text-surface-700 border border-surface-200 px-10 py-4 rounded-xl text-sm font-bold hover:bg-surface-50 transition-all"
                >
                  Doctor Login
                </Link>
              </motion.div>

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
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <FaUserMd className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">Dr. Mitchell</p>
                        <p className="text-[9px] text-primary-600 font-bold uppercase tracking-wider">Cardiology</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => <div key={i} className="w-1 h-1 bg-slate-300 rounded-full" />)}
                    </div>
                  </div>

                  {/* Dashboard Body */}
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">Patients</p>
                        <p className="text-2xl font-bold text-slate-900">1.2K</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest mb-1">Revenue</p>
                        <p className="text-2xl font-bold text-primary-600">₹2.4L</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Upcoming</p>
                      {[
                        { name: 'Ravi K.', time: '10:30', status: 'In Waitlist' },
                        { name: 'Priya S.', time: '11:45', status: 'Upcoming' },
                        { name: 'Amit D.', time: '14:00', status: 'Upcoming' }
                      ].map((apt, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                          <div className={`w-1 h-6 ${i === 0 ? 'bg-primary-500' : 'bg-slate-200'} rounded-full`} />
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-900">{apt.name}</p>
                            <p className="text-[8px] text-slate-400">{apt.time}</p>
                          </div>
                          <div className={`text-[8px] font-bold px-2 py-0.5 rounded-full ${i === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                            {apt.status}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Mockup */}
                    <div className="pt-2">
                      <div className="h-24 w-full bg-slate-50 rounded-2xl flex items-end justify-between px-4 py-2 gap-1 border border-slate-100">
                        {[40, 70, 45, 90, 65, 80, 50].map((h, i) => (
                          <div key={i} className="w-full bg-primary-200 rounded-t-sm" style={{ height: `${h}%` }} />
                        ))}
                      </div>
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



      {/* BENEFITS SECTION */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block px-3 py-1 bg-primary-50 text-primary-600 rounded text-[10px] font-bold uppercase tracking-widest mb-4">
              Why Join Us
            </div>
            <h2 className="text-4xl font-bold text-slate-900 font-display tracking-tight mb-4">
              Built for <span className="text-primary-600">Medical Professionals</span>
            </h2>
            <p className="text-slate-500 text-sm font-medium max-w-xl mx-auto">
              Everything you need to run a modern digital practice — from patient management to payments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                className="group p-8 rounded-3xl bg-white border border-slate-100 transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.06)]"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${b.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-primary-500/10`}>
                  <b.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">{b.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{b.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-white border-y border-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 font-display tracking-tight mb-4">
              Get Started in <span className="text-primary-600">4 Simple Steps</span>
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.4em]">
              From registration to your first consultation
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="relative text-center"
              >
                <div className="w-16 h-16 mx-auto bg-primary-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-primary-500/20">
                  <span className="text-xl font-bold text-white">{s.step}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{s.desc}</p>

                {/* Connector Line */}
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-slate-100" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 bg-primary-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/10 rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8 border border-white/30 backdrop-blur-sm">
            <FiTrendingUp className="w-4 h-4" />
            Global Growth Network
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white font-display tracking-tight mb-8 leading-tight">
            Ready to <span className="text-primary-200">Scale</span> Your <br />Clinical Practice?
          </h2>

          <p className="text-primary-50 text-base font-medium max-w-lg mx-auto mb-12 leading-relaxed opacity-90">
            Join thousands of verified medical professionals.
            Registration is streamlined and takes less than 2 minutes.
          </p>

          <div className="flex flex-wrap justify-center gap-5">
            <Link
              to="/doctor-corner/register"
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-10 py-4.5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-slate-50 transition-all shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1"
            >
              Get Started Now
              <FiArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/doctor-corner/login"
              className="inline-flex items-center gap-2 text-white border-2 border-white/30 px-10 py-4.5 rounded-2xl text-xs font-bold uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
            >
              Sign In
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap justify-center gap-12 mt-16 opacity-80">
            {[
              { icon: FiShield, text: 'HIPAA Compliant' },
              { icon: FiCheckCircle, text: 'Verified Profiles' },
              { icon: FiAward, text: 'Digital Excellence' },
            ].map((badge, i) => (
              <div key={i} className="flex items-center gap-2 text-white">
                <badge.icon className="w-4 h-4 text-primary-200" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-50 text-slate-900 pt-16 pb-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg">
                <FaStethoscope className="text-white w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight">E-Consult <span className="text-primary-600">Doctor</span></span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Professional Division</span>
              </div>
            </div>

            <p className="text-slate-400 text-xs font-medium order-3 md:order-2">
              © 2026 E-Consult Medical Platform. Clinical Accuracy Guaranteed.
            </p>

            <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500 order-2 md:order-3">
              {['Privacy Protocol', 'Terms', 'Specialist Support'].map((l) => (
                <a key={l} href="#" className="hover:text-primary-600 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

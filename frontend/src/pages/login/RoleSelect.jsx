import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiArrowRight } from 'react-icons/fi';
import { FaStethoscope, FaUserMd } from 'react-icons/fa';
import { HiOutlineUserGroup } from 'react-icons/hi';

const roles = [
  {
    id: 'patient',
    icon: FiUser,
    miniIcon: HiOutlineUserGroup,
    title: 'Patient',
    desc: 'Book a professional consultation, share your records, and receive expert care.',
    path: '/patient-form',
    color: 'bg-primary-600',
    bgColor: 'bg-primary-50',
    textColor: 'text-primary-600',
    shadow: 'shadow-primary-600/10',
  },
  {
    id: 'doctor',
    icon: FaStethoscope,
    miniIcon: FaUserMd,
    title: 'Doctor',
    desc: 'Access patient history, manage consultations, and provide digital prescriptions.',
    path: '/doctor',
    color: 'bg-secondary-600',
    bgColor: 'bg-secondary-50',
    textColor: 'text-secondary-600',
    shadow: 'shadow-secondary-600/10',
  },
];

export default function RoleSelect() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 px-6 py-8 medical-grid relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-8"
        >
          <div className="inline-block px-2.5 py-0.5 bg-white rounded border border-surface-200 text-[9px] font-black text-surface-400 uppercase tracking-[0.2em] mb-4 shadow-sm">
            Clinical Node
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-surface-900 mb-2 font-display uppercase tracking-tight">
            Select <span className="gradient-text">Identity</span>
          </h1>
          <p className="text-surface-500 text-[10px] max-w-xs mx-auto font-black uppercase tracking-widest leading-tight">
            Clinical workflow initialization required. Validate your role.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {roles.map((role, i) => (
            <Link key={role.id} to={role.path} className="group">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className={`relative h-full bg-white rounded-2xl p-5 border border-surface-200 hover:border-primary-100 transition-all shadow-sm`}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 ${role.color} rounded-xl flex items-center justify-center shadow-md ${role.shadow}`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <h2 className="text-sm font-black text-surface-900 mb-1 uppercase tracking-tight">{role.title}</h2>
                  <p className="text-surface-400 mb-6 text-[10px] font-black uppercase leading-tight">{role.desc}</p>

                  <div className={`flex items-center gap-2 ${role.textColor} font-black text-[9px] tracking-[0.2em] uppercase`}>
                    Authorize Access
                    <FiArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-8"
        >
          <Link to="/" className="text-[9px] font-black text-surface-400 hover:text-primary-600 transition-colors inline-flex items-center gap-2 group tracking-[0.2em] uppercase">
            <FiArrowRight className="w-3 h-3 rotate-180 transition-transform group-hover:-translate-x-1" /> Back to HQ
          </Link>
        </motion.div>
      </div>
    </div>
  );
}



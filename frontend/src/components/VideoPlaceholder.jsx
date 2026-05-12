import { FiVideo } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function VideoPlaceholder({ label, isActive = true, initials = '' }) {
  return (
    <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden flex items-center justify-center">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-br from-slate-800 to-slate-900" />

      {/* Animated circles background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-primary-500 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-secondary-500 rounded-full blur-3xl"
        />
      </div>

      {/* Avatar / Icon */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {initials ? (
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xl font-black shadow-lg">
            {initials}
          </div>
        ) : (
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
            <FiVideo className="w-6 h-6 text-white/60" />
          </div>
        )}
        <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">{label}</span>
        {isActive && (
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondary-500" />
            </span>
            <span className="text-secondary-400 text-[9px] font-black uppercase tracking-widest">TRANSMITTING</span>
          </div>
        )}
      </div>

      {/* Label badge */}
      <div className="absolute top-4 left-4 px-2 py-0.5 bg-black/40 backdrop-blur-md rounded border border-white/10 text-white/80 text-[8px] font-black uppercase tracking-widest">
        {label}
      </div>
    </div>
  );
}


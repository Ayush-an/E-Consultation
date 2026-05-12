import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

export default function FormStepper({ steps, currentStep }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress bar background */}
        <div className="absolute top-4.5 left-0 right-0 h-[2px] bg-surface-200 mx-10 rounded-full" />
        {/* Progress bar fill */}
        <motion.div
          className="absolute top-4.5 left-0 h-[2px] bg-primary-600 mx-10 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.2)] transition-all"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ maxWidth: `calc(100% - 5rem)` }}
        />

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isActive = currentStep === stepNumber;

          return (
            <div key={step} className="flex flex-col items-center relative z-10">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isActive ? 1.05 : 1 }}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-black border transition-all duration-500
                  ${isCompleted
                    ? 'bg-primary-600 border-primary-600 text-white shadow-md shadow-primary-500/10'
                    : isActive
                      ? 'bg-white border-primary-600 text-primary-600 shadow-premium'
                      : 'bg-white border-surface-200 text-surface-400'
                  }`}
              >
                {isCompleted ? <FiCheck className="w-4 h-4 stroke-[3]" /> : stepNumber}
              </motion.div>
              <span
                className={`mt-2 text-[9px] font-black text-center max-w-[80px] uppercase tracking-wider transition-colors duration-300
                  ${isActive ? 'text-primary-600' : isCompleted ? 'text-surface-900' : 'text-surface-400'}`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}


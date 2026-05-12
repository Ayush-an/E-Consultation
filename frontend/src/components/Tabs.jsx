import { motion } from 'framer-motion';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-surface-100 rounded-xl border border-surface-200 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative flex-1 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all duration-300 cursor-pointer
            ${activeTab === tab.id ? 'text-primary-700' : 'text-surface-500 hover:text-surface-700'}`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="activeTab"
              className="absolute inset-0 bg-white rounded-lg shadow-sm border border-surface-200"
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />
          )}
          <span className="relative z-10 flex items-center justify-center gap-1.5">
            {tab.icon && <tab.icon className={`w-3.5 h-3.5 transition-colors ${activeTab === tab.id ? 'text-primary-600' : 'text-surface-400'}`} />}
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  );
}

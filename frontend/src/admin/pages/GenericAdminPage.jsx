import { motion } from 'framer-motion';
import { FiTool } from 'react-icons/fi';

export default function GenericAdminPage({ title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[50vh] text-center"
    >
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
        <FiTool className="text-blue-600" size={28} />
      </div>
      <h1 className="text-2xl font-bold text-slate-900 font-display">{title}</h1>
      <p className="text-sm text-slate-500 mt-2 max-w-md">{description || 'This module is connected to the admin API layer and ready for extended configuration.'}</p>
    </motion.div>
  );
}

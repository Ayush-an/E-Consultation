import { motion } from 'framer-motion';

export default function Card({
  children,
  className = '',
  hover = false,
  glass = false,
  padding = 'p-6',
  onClick,
  ...props
}) {
  const baseClasses = `rounded-3xl border transition-all duration-500 ${padding}`;
  const hoverClasses = hover 
    ? 'hover:shadow-premium hover:-translate-y-1.5 cursor-pointer border-surface-200 shadow-sm' 
    : 'shadow-sm border-surface-100';
  const glassClasses = glass 
    ? 'bg-white/80 backdrop-blur-lg border-white/20' 
    : 'bg-white';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`${baseClasses} ${hoverClasses} ${glassClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
}

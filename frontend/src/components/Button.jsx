import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}) {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-premium hover:shadow-float',
    secondary: 'bg-secondary-600 text-white hover:bg-secondary-700 focus:ring-secondary-500 shadow-premium hover:shadow-float',
    outline: 'border-2 border-slate-200 text-slate-700 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-400',
    danger: 'bg-accent-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-premium shadow-red-500/20',
  };

  const sizes = {
    sm: 'px-2.5 py-1 text-[10px] gap-1',
    md: 'px-4 py-2 text-[11px] gap-1.5',
    lg: 'px-5 py-2.5 text-xs gap-2',
    xl: 'px-6 py-3 text-sm gap-2.5 font-bold',
  };

  return (
    <motion.button
      whileHover={!disabled && !loading ? { y: -2 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98, y: 0 } : {}}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? (
        <Icon className={`${size === 'xl' ? 'w-5 h-5' : 'w-4 h-4'} transition-transform duration-300 group-hover:translate-x-1`} />
      ) : null}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

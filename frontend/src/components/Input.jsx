import { forwardRef } from 'react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  type = 'text',
  required = false,
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-black text-surface-400 mb-1.5 ml-1 tracking-widest">
          {label}
          {required && <span className="text-accent-600 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400 group-focus-within:text-primary-500 transition-colors duration-300">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-surface-900 text-sm
            placeholder:text-surface-400 transition-all duration-300 shadow-sm
            focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500
            hover:border-surface-300
            ${Icon ? 'pl-11' : ''}
            ${error ? 'border-accent-600 focus:ring-accent-600/10 focus:border-accent-600' : ''}
            ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-[10px] font-black text-accent-600 flex items-center gap-1.5 ml-1 tracking-wider">
          {Icon && <Icon className="w-3 h-3" />}
          {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;

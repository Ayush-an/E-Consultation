import { motion } from 'framer-motion';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { formatNumber, formatCurrency } from '../../utils/formatters';

const sparkData = Array.from({ length: 12 }, (_, i) => ({ v: Math.random() * 50 + 20 + i * 2 }));

export default function KPICard({ title, value, growth, icon: Icon, color = 'blue', isCurrency, delay = 0 }) {
  const colors = {
    blue: { bg: 'from-blue-500 to-blue-600', light: 'bg-blue-50 text-blue-600', stroke: '#3b82f6' },
    emerald: { bg: 'from-emerald-500 to-emerald-600', light: 'bg-emerald-50 text-emerald-600', stroke: '#10b981' },
    slate: { bg: 'from-slate-600 to-slate-700', light: 'bg-slate-100 text-slate-600', stroke: '#64748b' },
    violet: { bg: 'from-violet-500 to-violet-600', light: 'bg-violet-50 text-violet-600', stroke: '#8b5cf6' },
  };
  const c = colors[color] || colors.blue;
  const isPositive = growth >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:shadow-slate-200/50 transition-shadow overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white to-slate-50/50 opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${c.bg} text-white shadow-lg`}>
            <Icon size={20} />
          </div>
          <div className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
            {isPositive ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
            {Math.abs(growth)}%
          </div>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
        <p className="text-2xl font-bold text-slate-900 font-display">
          {isCurrency ? formatCurrency(value) : formatNumber(value)}
        </p>
        <div className="h-10 mt-3 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <Area
                type="monotone"
                dataKey="v"
                stroke={c.stroke}
                fill={c.stroke}
                fillOpacity={0.1}
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
}

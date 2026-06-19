import { motion } from 'framer-motion';
import { FiWifi, FiActivity, FiServer } from 'react-icons/fi';

const icons = { users: FiWifi, doctors: FiActivity, clinics: FiServer };

export function RealTimeWidget({ label, value, unit, icon, color = 'blue', pulse }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    emerald: 'from-emerald-500 to-emerald-600',
    violet: 'from-violet-500 to-violet-600',
    amber: 'from-amber-500 to-amber-600',
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-slate-100 p-4 overflow-hidden"
    >
      {pulse && (
        <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      )}
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center text-white mb-3`}>
        {icon || <FiActivity size={16} />}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="text-xl font-bold text-slate-900 mt-0.5">
        {value}{unit && <span className="text-sm font-normal text-slate-400 ml-0.5">{unit}</span>}
      </p>
    </motion.div>
  );
}

export function ActivityTimeline({ activities = [] }) {
  const typeColors = {
    USER_REGISTERED: 'bg-blue-500',
    DOCTOR_APPROVED: 'bg-emerald-500',
    CLINIC_APPROVED: 'bg-violet-500',
    CONSULTATION_COMPLETED: 'bg-amber-500',
    PAYMENT_RECEIVED: 'bg-emerald-500',
  };

  return (
    <div className="space-y-0">
      {activities.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex gap-3 py-3 border-b border-slate-50 last:border-0"
        >
          <div className="relative flex flex-col items-center">
            <div className={`w-2.5 h-2.5 rounded-full ${typeColors[item.type] || 'bg-slate-400'} ring-4 ring-white`} />
            {i < activities.length - 1 && <div className="w-px flex-1 bg-slate-100 mt-1" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800">{item.title}</p>
            <p className="text-xs text-slate-500 mt-0.5 truncate">{item.description}</p>
            <p className="text-[10px] text-slate-400 mt-1">
              {new Date(item.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function NotificationCenter({ notifications = [] }) {
  const priorityStyles = {
    critical: 'border-l-red-500 bg-red-50/50',
    high: 'border-l-amber-500 bg-amber-50/50',
    medium: 'border-l-blue-500 bg-blue-50/50',
  };

  return (
    <div className="space-y-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`flex items-center justify-between p-3 rounded-xl border-l-4 ${priorityStyles[n.priority] || 'border-l-slate-300'}`}
        >
          <div>
            <p className="text-sm font-semibold text-slate-800">{n.title}</p>
            <p className="text-xs text-slate-500 capitalize">{n.priority} priority</p>
          </div>
          <span className="text-lg font-bold text-slate-900">{n.count}</span>
        </div>
      ))}
    </div>
  );
}

export function QuickActions({ onAction }) {
  const actions = [
    { id: 'approve-doctor', label: 'Approve Doctor', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { id: 'approve-clinic', label: 'Approve Clinic', color: 'bg-blue-600 hover:bg-blue-700' },
    { id: 'add-admin', label: 'Add Admin', color: 'bg-violet-600 hover:bg-violet-700' },
    { id: 'broadcast', label: 'Broadcast Notification', color: 'bg-slate-700 hover:bg-slate-800' },
    { id: 'subscription', label: 'Create Subscription Plan', color: 'bg-amber-600 hover:bg-amber-700' },
    { id: 'report', label: 'Generate Report', color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {actions.map((a) => (
        <motion.button
          key={a.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onAction?.(a.id)}
          className={`${a.color} text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors`}
        >
          {a.label}
        </motion.button>
      ))}
    </div>
  );
}

export function GeoMapView({ data = [] }) {
  const maxUsers = Math.max(...data.map((d) => d.users), 1);

  return (
    <div className="space-y-3">
      {data.map((state, i) => (
        <motion.div
          key={state.state}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-slate-700">{state.state}</span>
            <span className="text-xs text-slate-400">{state.users} users · {state.clinics} clinics</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(state.users / maxUsers) * 100}%` }}
              transition={{ duration: 0.8, delay: i * 0.1 }}
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

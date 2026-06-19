import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { FiShield, FiUsers, FiKey } from 'react-icons/fi';
import { adminApi } from '../../services/adminApi';

export default function RoleManagement() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'roles'],
    queryFn: adminApi.getRoles,
  });

  const roleColors = {
    SUPERADMIN: 'from-red-500 to-red-600',
    ADMIN: 'from-blue-500 to-blue-600',
    MANAGER: 'from-violet-500 to-violet-600',
    SUPPORT: 'from-emerald-500 to-emerald-600',
    AUDITOR: 'from-slate-500 to-slate-600',
  };

  if (isLoading) {
    return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Role Management</h1>
        <p className="text-sm text-slate-500 mt-1">Configure roles and permissions for platform access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.roles?.map((role, i) => (
          <motion.div
            key={role.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${roleColors[role.slug] || roleColors.ADMIN} text-white`}>
                <FiShield size={20} />
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <FiUsers size={12} /> {role.users} users
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{role.name}</h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{role.slug}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {role.permissions.map((p) => (
                <span key={p} className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-semibold rounded-full border border-slate-100">
                  <FiKey size={10} /> {p}
                </span>
              ))}
            </div>
            <button className="mt-4 w-full py-2 text-xs font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              Edit Permissions
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

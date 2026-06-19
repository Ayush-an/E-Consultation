import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { adminApi } from '../../services/adminApi';
import { useToast } from '../../../hooks/useToast';

export default function GeneralSettings() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: adminApi.getSettings,
  });

  const [form, setForm] = useState(null);

  const display = form || settings || {};

  const mutation = useMutation({
    mutationFn: adminApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      addToast('Settings saved successfully', 'success');
    },
  });

  const update = (key, value) => setForm({ ...display, [key]: value });

  if (isLoading) return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse" />;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Platform configuration and integrations</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
        <h3 className="text-sm font-bold text-slate-800">General Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Name</label>
            <input
              value={display.platformName || ''}
              onChange={(e) => update('platformName', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Theme</label>
            <select
              value={display.theme || 'light'}
              onChange={(e) => update('theme', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Email</label>
            <input
              value={display.contactEmail || ''}
              onChange={(e) => update('contactEmail', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Contact Phone</label>
            <input
              value={display.contactPhone || ''}
              onChange={(e) => update('contactPhone', e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-100">
          <div>
            <p className="text-sm font-semibold text-amber-800">Maintenance Mode</p>
            <p className="text-xs text-amber-600">Temporarily disable platform access</p>
          </div>
          <button
            onClick={() => update('maintenanceMode', !display.maintenanceMode)}
            className={`w-12 h-6 rounded-full transition-colors ${display.maintenanceMode ? 'bg-amber-500' : 'bg-slate-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${display.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>

        <button
          onClick={() => mutation.mutate(display)}
          disabled={mutation.isPending}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </motion.div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { RealTimeWidget } from '../../components/dashboard/DashboardWidgets';
import { ChartCard, TrendAreaChart } from '../../components/charts/ChartComponents';

export default function RealTimeMonitoring() {
  const { data: realtime } = useQuery({
    queryKey: ['admin', 'realtime'],
    queryFn: adminApi.getRealtimeStats,
    refetchInterval: 30000,
  });

  const { data: charts } = useQuery({
    queryKey: ['admin', 'charts', 'daily'],
    queryFn: () => adminApi.getDashboardCharts('daily'),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Real-Time Monitoring</h1>
        <p className="text-sm text-slate-500 mt-1">Live platform metrics — auto-refreshes every 30 seconds</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <RealTimeWidget label="Online Users" value={realtime?.onlineUsers ?? '—'} color="blue" pulse />
        <RealTimeWidget label="Active Doctors" value={realtime?.activeDoctors ?? '—'} color="emerald" pulse />
        <RealTimeWidget label="Active Clinics" value={realtime?.activeClinics ?? '—'} color="violet" />
        <RealTimeWidget label="Ongoing Consultations" value={realtime?.ongoingConsultations ?? '—'} color="amber" pulse />
        <RealTimeWidget label="Current Revenue" value={`₹${((realtime?.currentRevenue ?? 0) / 1000).toFixed(0)}K`} color="emerald" />
        <RealTimeWidget label="Server Health" value={realtime?.serverHealth ?? '—'} unit="%" color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Active Users (24h)" subtitle="Real-time user activity">
          <TrendAreaChart data={charts?.activeUsers} color="#3b82f6" />
        </ChartCard>
        <ChartCard title="Ongoing Consultations" subtitle="Live consultation volume">
          <TrendAreaChart data={charts?.consultationTrend} color="#10b981" />
        </ChartCard>
      </div>
    </div>
  );
}

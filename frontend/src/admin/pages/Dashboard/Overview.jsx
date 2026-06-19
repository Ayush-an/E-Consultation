import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FiUsers, FiUserCheck, FiHome, FiHeart, FiVideo, FiCalendar, FiDollarSign, FiTrendingUp,
} from 'react-icons/fi';
import { adminApi } from '../../services/adminApi';
import KPICard from '../../components/dashboard/KPICard';
import {
  RealTimeWidget, ActivityTimeline, NotificationCenter, QuickActions, GeoMapView,
} from '../../components/dashboard/DashboardWidgets';
import { ChartCard, TrendAreaChart, DistributionPieChart } from '../../components/charts/ChartComponents';
import { useToast } from '../../../hooks/useToast';

export default function Overview() {
  const [chartPeriod, setChartPeriod] = useState('monthly');
  const { addToast } = useToast();

  const { data: stats } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: adminApi.getDashboardStats,
    refetchInterval: 60000,
  });

  const { data: charts } = useQuery({
    queryKey: ['admin', 'charts', chartPeriod],
    queryFn: () => adminApi.getDashboardCharts(chartPeriod),
  });

  const { data: realtime } = useQuery({
    queryKey: ['admin', 'realtime'],
    queryFn: adminApi.getRealtimeStats,
    refetchInterval: 30000,
  });

  const { data: activity } = useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: adminApi.getRecentActivity,
  });

  const { data: notifications } = useQuery({
    queryKey: ['admin', 'notifications'],
    queryFn: adminApi.getNotifications,
  });

  const { data: geo } = useQuery({
    queryKey: ['admin', 'geo'],
    queryFn: adminApi.getGeoAnalytics,
  });

  const kpiCards = stats ? [
    { title: 'Total Users', value: stats.totalUsers, growth: stats.growth?.users, icon: FiUsers, color: 'blue' },
    { title: 'Total Doctors', value: stats.totalDoctors, growth: stats.growth?.doctors, icon: FiUserCheck, color: 'emerald' },
    { title: 'Total Clinics', value: stats.totalClinics, growth: stats.growth?.clinics, icon: FiHome, color: 'violet' },
    { title: 'Total Patients', value: stats.totalPatients, growth: stats.growth?.patients, icon: FiHeart, color: 'blue' },
    { title: 'Consultations', value: stats.totalConsultations, growth: stats.growth?.consultations, icon: FiVideo, color: 'emerald' },
    { title: "Today's Appointments", value: stats.todayAppointments, growth: stats.growth?.appointments, icon: FiCalendar, color: 'slate' },
    { title: 'Revenue', value: stats.revenue, growth: stats.growth?.revenue, icon: FiDollarSign, color: 'emerald', isCurrency: true },
    { title: 'Platform Growth', value: stats.platformGrowth, growth: stats.platformGrowth, icon: FiTrendingUp, color: 'blue' },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Dashboard Overview</h1>
        <p className="text-sm text-slate-500 mt-1">Enterprise healthcare platform analytics at a glance</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card, i) => (
          <KPICard key={card.title} {...card} delay={i * 0.05} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ChartCard
            title="User Growth"
            subtitle="Platform user acquisition trend"
            action={
              <div className="flex gap-1 bg-slate-100 rounded-lg p-0.5">
                {['daily', 'weekly', 'monthly'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setChartPeriod(p)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                      chartPeriod === p ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            }
          >
            <TrendAreaChart data={charts?.userGrowth} color="#3b82f6" />
          </ChartCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Consultation Trend" subtitle="Daily consultations">
              <TrendAreaChart data={charts?.consultationTrend} color="#10b981" height={220} />
            </ChartCard>
            <ChartCard title="Revenue Trend" subtitle="Platform revenue">
              <TrendAreaChart data={charts?.revenueTrend} color="#8b5cf6" height={220} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ChartCard title="User Distribution">
              <DistributionPieChart data={charts?.userDistribution} />
            </ChartCard>
            <ChartCard title="Consultation Types">
              <DistributionPieChart data={charts?.consultationDistribution} />
            </ChartCard>
            <ChartCard title="Revenue Sources">
              <DistributionPieChart data={charts?.revenueDistribution} />
            </ChartCard>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-800">Real-Time Monitoring</h3>
              <span className="text-[10px] font-bold text-emerald-600 uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <RealTimeWidget label="Online Users" value={realtime?.onlineUsers ?? '—'} color="blue" pulse />
              <RealTimeWidget label="Active Doctors" value={realtime?.activeDoctors ?? '—'} color="emerald" pulse />
              <RealTimeWidget label="Active Clinics" value={realtime?.activeClinics ?? '—'} color="violet" />
              <RealTimeWidget label="Ongoing Consults" value={realtime?.ongoingConsultations ?? '—'} color="amber" pulse />
              <RealTimeWidget label="Today's Revenue" value={`₹${((realtime?.currentRevenue ?? 0) / 1000).toFixed(0)}K`} color="emerald" />
              <RealTimeWidget label="Server Health" value={realtime?.serverHealth ?? '—'} unit="%" color="blue" />
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Notification Center</h3>
            <NotificationCenter notifications={notifications} />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Quick Actions</h3>
            <QuickActions onAction={(id) => addToast(`Action: ${id}`, 'info')} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Geographical Analytics</h3>
          <GeoMapView data={geo?.usersByState} />
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Recent Activity</h3>
          <ActivityTimeline activities={activity?.slice(0, 8)} />
        </div>
      </div>
    </div>
  );
}

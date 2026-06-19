import { useQuery } from '@tanstack/react-query';
import { FiDollarSign, FiTrendingUp, FiRotateCcw, FiPercent } from 'react-icons/fi';
import { adminApi } from '../../services/adminApi';
import KPICard from '../../components/dashboard/KPICard';
import { ChartCard, TrendAreaChart, TrendBarChart } from '../../components/charts/ChartComponents';
import DataTable, { StatusBadge } from '../../components/tables/DataTable';
import { formatCurrency } from '../../utils/formatters';

export default function RevenueDashboard() {
  const { data: revenue, isLoading } = useQuery({
    queryKey: ['admin', 'revenue'],
    queryFn: adminApi.getRevenue,
  });

  const clinicColumns = [
    { header: 'Clinic', accessor: 'name' },
    { header: 'City', accessor: 'city' },
    { header: 'Revenue', accessor: (r) => formatCurrency(r.revenue) },
    { header: 'Doctors', accessor: 'doctors' },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  const doctorColumns = [
    { header: 'Doctor', accessor: 'name' },
    { header: 'Revenue', accessor: (r) => formatCurrency(r.revenue) },
    { header: 'Consultations', accessor: 'consultations' },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Revenue Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Financial overview and revenue analytics</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard title="Total Revenue" value={revenue?.totalRevenue} growth={18.2} icon={FiDollarSign} color="emerald" isCurrency />
        <KPICard title="Monthly Revenue" value={revenue?.monthlyRevenue} growth={12.5} icon={FiTrendingUp} color="blue" isCurrency />
        <KPICard title="Today's Revenue" value={revenue?.todayRevenue} growth={8.3} icon={FiDollarSign} color="violet" isCurrency />
        <KPICard title="Subscriptions" value={revenue?.subscriptionRevenue} growth={15.1} icon={FiPercent} color="blue" isCurrency />
        <KPICard title="Commissions" value={revenue?.commissionRevenue} growth={9.7} icon={FiPercent} color="emerald" isCurrency />
        <KPICard title="Refunds" value={revenue?.refundAmount} growth={-2.1} icon={FiRotateCcw} color="slate" isCurrency />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Revenue Trend" subtitle="30-day revenue performance">
          <TrendAreaChart data={revenue?.revenueTrend} color="#10b981" />
        </ChartCard>
        <ChartCard title="Monthly Revenue" subtitle="Year-to-date breakdown">
          <TrendBarChart data={revenue?.monthlyBreakdown} dataKey="revenue" color="#3b82f6" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DataTable
          title="Top Revenue Clinics"
          columns={clinicColumns}
          data={revenue?.topClinics || []}
          searchable={false}
          exportable={false}
          pagination={false}
        />
        <DataTable
          title="Top Revenue Doctors"
          columns={doctorColumns}
          data={revenue?.topDoctors || []}
          searchable={false}
          exportable={false}
          pagination={false}
        />
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { ChartCard, TrendAreaChart, DistributionPieChart } from '../../components/charts/ChartComponents';

export default function AnalyticsPage({ title, chartKey = 'userGrowth', pieKey = 'userDistribution' }) {
  const { data: charts } = useQuery({
    queryKey: ['admin', 'charts', 'monthly'],
    queryFn: () => adminApi.getDashboardCharts('monthly'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">{title}</h1>
        <p className="text-sm text-slate-500 mt-1">Detailed analytics and insights</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ChartCard title={`${title} Trend`} subtitle="Monthly performance">
            <TrendAreaChart data={charts?.[chartKey]} color="#3b82f6" />
          </ChartCard>
        </div>
        <ChartCard title="Distribution">
          <DistributionPieChart data={charts?.[pieKey]} />
        </ChartCard>
      </div>
    </div>
  );
}

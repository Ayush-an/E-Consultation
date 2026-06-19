import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import { ActivityTimeline } from '../../components/dashboard/DashboardWidgets';

export default function ActivityFeed() {
  const { data: activity, isLoading } = useQuery({
    queryKey: ['admin', 'activity'],
    queryFn: adminApi.getRecentActivity,
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Activity Feed</h1>
        <p className="text-sm text-slate-500 mt-1">Latest platform events and administrative actions</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-sm max-w-2xl">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <ActivityTimeline activities={activity} />
        )}
      </div>
    </div>
  );
}

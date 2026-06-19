import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import DataTable, { StatusBadge } from '../../components/tables/DataTable';
import { formatDateTime } from '../../utils/formatters';

export default function AuditLogs() {
  const [actionFilter, setActionFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit', actionFilter],
    queryFn: () => adminApi.getAuditLogs({ action: actionFilter || undefined }),
  });

  const columns = [
    { header: 'Admin', accessor: 'admin' },
    { header: 'Action', accessor: 'action', render: (r) => <StatusBadge status={r.action} /> },
    { header: 'Resource', accessor: 'resource' },
    { header: 'Timestamp', accessor: (r) => formatDateTime(r.timestamp) },
    { header: 'IP Address', accessor: 'ip' },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      title="Audit Logs"
      subtitle="Complete audit trail of administrative actions"
      columns={columns}
      data={data?.logs || []}
      loading={isLoading}
      pagination={false}
      filters={
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
        >
          <option value="">All Actions</option>
          <option value="APPROVE">Approve</option>
          <option value="UPDATE">Update</option>
          <option value="BLOCK">Block</option>
          <option value="LOGIN">Login</option>
          <option value="VIEW">View</option>
        </select>
      }
    />
  );
}

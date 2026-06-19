import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import DataTable, { StatusBadge } from '../../components/tables/DataTable';
import { formatDateTime } from '../../utils/formatters';

export default function ConsultationManagement({ title = 'All Consultations', statusFilter }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const statusMap = {
    ongoing: 'ACTIVE',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'consultations', statusFilter, page],
    queryFn: () => adminApi.getConsultations({
      status: statusMap[statusFilter] || statusFilter,
      page,
      limit: 10,
    }),
  });

  const columns = [
    { header: 'Doctor', accessor: 'doctor' },
    { header: 'Patient', accessor: 'patient' },
    { header: 'Type', accessor: 'type' },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Start', accessor: (r) => formatDateTime(r.startTime) },
    { header: 'End', accessor: (r) => formatDateTime(r.endTime) },
  ];

  return (
    <DataTable
      title={title}
      subtitle="Monitor and manage all platform consultations"
      columns={columns}
      data={data?.consultations || []}
      loading={isLoading}
      page={page}
      total={data?.total}
      onPageChange={setPage}
      onSearch={setSearch}
    />
  );
}

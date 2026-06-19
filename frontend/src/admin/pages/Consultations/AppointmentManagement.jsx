import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import DataTable, { StatusBadge } from '../../components/tables/DataTable';
import { formatDate } from '../../utils/formatters';

export default function AppointmentManagement({ title = 'Appointments', statusFilter }) {
  const [page, setPage] = useState(1);

  const statusMap = {
    upcoming: 'BOOKED',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
    rescheduled: 'BOOKED',
  };

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'appointments', statusFilter, page],
    queryFn: () => adminApi.getAppointments({
      status: statusMap[statusFilter] || statusFilter,
      page,
      limit: 10,
    }),
  });

  const columns = [
    { header: 'Doctor', accessor: 'doctor' },
    { header: 'Patient', accessor: 'patient' },
    { header: 'Date', accessor: (r) => formatDate(r.date) },
    { header: 'Time', accessor: 'time' },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      title={title}
      subtitle="Appointment scheduling and status management"
      columns={columns}
      data={data?.appointments || []}
      loading={isLoading}
      page={page}
      total={data?.total}
      onPageChange={setPage}
    />
  );
}

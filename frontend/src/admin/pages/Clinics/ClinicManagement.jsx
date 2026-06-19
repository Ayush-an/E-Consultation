import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCheck, FiX, FiPause, FiPlay } from 'react-icons/fi';
import { adminApi } from '../../services/adminApi';
import DataTable, { StatusBadge } from '../../components/tables/DataTable';
import { formatCurrency } from '../../utils/formatters';
import { useToast } from '../../../hooks/useToast';

export default function ClinicManagement({ title = 'All Clinics', statusFilter }) {
  const [search, setSearch] = useState('');
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'clinics', statusFilter, search],
    queryFn: () => adminApi.getClinics({ status: statusFilter, search }),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }) => adminApi.updateClinicStatus(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'clinics'] });
      addToast('Clinic updated', 'success');
    },
  });

  const columns = [
    { header: 'Clinic Name', accessor: 'name' },
    { header: 'City', accessor: 'city' },
    { header: 'State', accessor: 'state' },
    { header: 'Doctors', accessor: 'doctors' },
    { header: 'Patients', accessor: 'patients' },
    { header: 'Revenue', accessor: (r) => formatCurrency(r.revenue) },
    { header: 'Rating', accessor: (r) => `⭐ ${r.rating}` },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <DataTable
      title={title}
      subtitle="Clinic onboarding, approval, and performance tracking"
      columns={columns}
      data={data?.clinics || []}
      loading={isLoading}
      onSearch={setSearch}
      pagination={false}
      actions={(row) => (
        <>
          <button onClick={() => actionMutation.mutate({ id: row.id, action: 'approve' })} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Approve">
            <FiCheck size={15} />
          </button>
          <button onClick={() => actionMutation.mutate({ id: row.id, action: 'reject' })} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject">
            <FiX size={15} />
          </button>
          <button onClick={() => actionMutation.mutate({ id: row.id, action: 'suspend' })} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Suspend">
            <FiPause size={15} />
          </button>
          <button onClick={() => actionMutation.mutate({ id: row.id, action: 'activate' })} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Activate">
            <FiPlay size={15} />
          </button>
        </>
      )}
    />
  );
}

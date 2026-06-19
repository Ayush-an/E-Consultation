import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiEye, FiEdit2, FiSlash, FiTrash2, FiPause } from 'react-icons/fi';
import { adminApi } from '../../services/adminApi';
import DataTable, { StatusBadge } from '../../components/tables/DataTable';
import { formatDate } from '../../utils/formatters';
import { useToast } from '../../../hooks/useToast';

export default function UserManagement({ title = 'All Users', roleFilter, statusFilter }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', roleFilter, statusFilter, page, search],
    queryFn: () => adminApi.getUsers({
      role: roleFilter,
      status: statusFilter,
      search,
      page,
      limit: 10,
    }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => adminApi.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      addToast('User status updated', 'success');
    },
    onError: () => addToast('Failed to update user', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      addToast('User deleted', 'success');
    },
    onError: () => addToast('Failed to delete user', 'error'),
  });

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: (r) => r.email || '—' },
    { header: 'Phone', accessor: 'phone' },
    { header: 'Role', accessor: 'role', render: (r) => <StatusBadge status={r.role} /> },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
    { header: 'Registered', accessor: (r) => formatDate(r.registrationDate || r.created_at) },
  ];

  return (
    <DataTable
      title={title}
      subtitle="Advanced user management with search, filters, and bulk actions"
      columns={columns}
      data={data?.users || []}
      loading={isLoading}
      page={page}
      total={data?.total}
      pageSize={10}
      onPageChange={setPage}
      onSearch={setSearch}
      actions={(row) => (
        <>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="View">
            <FiEye size={15} />
          </button>
          <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Edit">
            <FiEdit2 size={15} />
          </button>
          <button
            onClick={() => statusMutation.mutate({ id: row.id, status: 'BLOCKED' })}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
            title="Block"
          >
            <FiSlash size={15} />
          </button>
          <button
            onClick={() => statusMutation.mutate({ id: row.id, status: 'SUSPENDED' })}
            className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600"
            title="Suspend"
          >
            <FiPause size={15} />
          </button>
          <button
            onClick={() => deleteMutation.mutate(row.id)}
            className="p-1.5 rounded-lg hover:bg-red-50 text-red-600"
            title="Delete"
          >
            <FiTrash2 size={15} />
          </button>
        </>
      )}
    />
  );
}

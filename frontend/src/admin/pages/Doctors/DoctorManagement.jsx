import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCheck, FiX, FiPause, FiShield, FiStar } from 'react-icons/fi';
import { adminApi } from '../../services/adminApi';
import DataTable, { StatusBadge } from '../../components/tables/DataTable';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useToast } from '../../../hooks/useToast';

export default function DoctorManagement({ title = 'All Doctors', statusFilter }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'doctors', statusFilter, page, search],
    queryFn: () => adminApi.getDoctors({ status: statusFilter, search, page, limit: 10 }),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }) => adminApi.updateDoctorStatus(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctors'] });
      addToast('Doctor updated successfully', 'success');
    },
  });

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Specialization', accessor: 'specialization' },
    { header: 'Experience', accessor: (r) => `${r.experience || 0} yrs` },
    { header: 'Verification', accessor: 'verificationStatus', render: (r) => <StatusBadge status={r.verificationStatus} /> },
    { header: 'Consultations', accessor: 'consultationCount' },
    { header: 'Earnings', accessor: (r) => formatCurrency(r.earnings) },
    { header: 'Rating', accessor: (r) => `⭐ ${r.rating}` },
    { header: 'Status', accessor: 'status', render: (r) => <StatusBadge status={r.status} /> },
  ];

  return (
    <div className="space-y-6">
      <DataTable
        title={title}
        subtitle="Doctor verification, performance, and management"
        columns={columns}
        data={data?.doctors || []}
        loading={isLoading}
        page={page}
        onPageChange={setPage}
        onSearch={setSearch}
        actions={(row) => (
          <>
            <button
              onClick={() => setSelectedDoctor(row)}
              className="px-2 py-1 text-[10px] font-bold uppercase bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
            >
              View
            </button>
            <button onClick={() => actionMutation.mutate({ id: row.id, action: 'approve' })} className="p-1.5 rounded-lg hover:bg-emerald-50 text-emerald-600" title="Approve">
              <FiCheck size={15} />
            </button>
            <button onClick={() => actionMutation.mutate({ id: row.id, action: 'verify' })} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600" title="Verify">
              <FiShield size={15} />
            </button>
            <button onClick={() => actionMutation.mutate({ id: row.id, action: 'suspend' })} className="p-1.5 rounded-lg hover:bg-amber-50 text-amber-600" title="Suspend">
              <FiPause size={15} />
            </button>
            <button onClick={() => actionMutation.mutate({ id: row.id, action: 'reject' })} className="p-1.5 rounded-lg hover:bg-red-50 text-red-600" title="Reject">
              <FiX size={15} />
            </button>
          </>
        )}
      />

      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDoctor(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Doctor Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-400 text-xs">Name</p><p className="font-semibold">{selectedDoctor.name}</p></div>
              <div><p className="text-slate-400 text-xs">Email</p><p className="font-semibold">{selectedDoctor.email || '—'}</p></div>
              <div><p className="text-slate-400 text-xs">Phone</p><p className="font-semibold">{selectedDoctor.phone}</p></div>
              <div><p className="text-slate-400 text-xs">Specialization</p><p className="font-semibold">{selectedDoctor.specialization}</p></div>
              <div><p className="text-slate-400 text-xs">Experience</p><p className="font-semibold">{selectedDoctor.experience} years</p></div>
              <div><p className="text-slate-400 text-xs">Fee</p><p className="font-semibold">{formatCurrency(selectedDoctor.consultationFee)}</p></div>
              <div><p className="text-slate-400 text-xs">Consultations</p><p className="font-semibold">{selectedDoctor.consultationCount}</p></div>
              <div><p className="text-slate-400 text-xs">Earnings</p><p className="font-semibold">{formatCurrency(selectedDoctor.earnings)}</p></div>
              <div><p className="text-slate-400 text-xs">Rating</p><p className="font-semibold flex items-center gap-1"><FiStar className="text-amber-400" /> {selectedDoctor.rating}</p></div>
              <div><p className="text-slate-400 text-xs">Registered</p><p className="font-semibold">{formatDate(selectedDoctor.registrationDate)}</p></div>
            </div>
            <button onClick={() => setSelectedDoctor(null)} className="mt-6 w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

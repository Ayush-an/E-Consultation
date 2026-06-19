import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/adminApi';
import DataTable from '../../components/tables/DataTable';
import { formatDate } from '../../utils/formatters';

export default function EHRRecords() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'ehr', 'records'],
    queryFn: adminApi.getEHRRecords,
  });

  const columns = [
    { header: 'Patient', accessor: 'patient' },
    { header: 'Symptoms', accessor: 'symptoms' },
    { header: 'Date', accessor: (r) => formatDate(r.createdAt) },
  ];

  return (
    <DataTable
      title="Medical Records"
      subtitle="Electronic health records across the platform"
      columns={columns}
      data={data?.records || []}
      loading={isLoading}
      pagination={false}
    />
  );
}

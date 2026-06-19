import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiFile } from 'react-icons/fi';
import { useToast } from '../../../hooks/useToast';
import { exportToCSV, exportToExcel } from '../../utils/export';

const reportTypes = [
  { id: 'users', name: 'User Report', description: 'Complete user registration and activity data' },
  { id: 'doctors', name: 'Doctor Report', description: 'Doctor profiles, verification, and earnings' },
  { id: 'clinics', name: 'Clinic Report', description: 'Clinic performance and revenue metrics' },
  { id: 'consultations', name: 'Consultation Report', description: 'Consultation volume and outcomes' },
  { id: 'revenue', name: 'Revenue Report', description: 'Financial transactions and revenue breakdown' },
];

const sampleData = [
  { name: 'Sample Record 1', value: 1250, date: '2026-06-01' },
  { name: 'Sample Record 2', value: 890, date: '2026-06-02' },
  { name: 'Sample Record 3', value: 2100, date: '2026-06-03' },
];

const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Value', accessor: 'value' },
  { header: 'Date', accessor: 'date' },
];

export default function ReportGeneration() {
  const [selected, setSelected] = useState(null);
  const { addToast } = useToast();

  const handleExport = (format) => {
    const report = reportTypes.find((r) => r.id === selected);
    if (!report) return;

    if (format === 'csv') exportToCSV(sampleData, columns, `${report.id}-report.csv`);
    else if (format === 'excel') exportToExcel(sampleData, columns, `${report.id}-report.xls`);
    else addToast(`PDF report "${report.name}" generated`, 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-display">Report Generation</h1>
        <p className="text-sm text-slate-500 mt-1">Generate and export platform reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report, i) => (
          <motion.button
            key={report.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelected(report.id)}
            className={`text-left p-5 rounded-2xl border transition-all ${
              selected === report.id
                ? 'bg-blue-50 border-blue-300 shadow-md shadow-blue-500/10'
                : 'bg-white/80 border-slate-100 hover:border-slate-200 hover:shadow-sm'
            }`}
          >
            <FiFileText className={`mb-3 ${selected === report.id ? 'text-blue-600' : 'text-slate-400'}`} size={24} />
            <h3 className="text-sm font-bold text-slate-800">{report.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{report.description}</p>
          </motion.button>
        ))}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 p-6 shadow-sm"
        >
          <h3 className="text-sm font-bold text-slate-800 mb-4">Export Format</h3>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => handleExport('pdf')} className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl transition-colors">
              <FiFile size={16} /> Generate PDF
            </button>
            <button onClick={() => handleExport('excel')} className="flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
              <FiDownload size={16} /> Export Excel
            </button>
            <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-colors">
              <FiDownload size={16} /> Export CSV
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiFilter } from 'react-icons/fi';
import { Skeleton } from '../../../components/Skeleton';
import { exportToCSV, exportToExcel } from '../../utils/export';

export default function DataTable({
  title,
  subtitle,
  columns,
  data = [],
  loading,
  searchable = true,
  exportable = true,
  pagination = true,
  pageSize = 10,
  total,
  page = 1,
  onPageChange,
  onSearch,
  filters,
  bulkActions,
  selectedRows,
  onSelectRow,
  onSelectAll,
  actions,
}) {
  const [search, setSearch] = useState('');
  const [localPage, setLocalPage] = useState(1);
  const currentPage = onPageChange ? page : localPage;
  const setPage = onPageChange || setLocalPage;

  const handleSearch = (val) => {
    setSearch(val);
    onSearch?.(val);
    setPage(1);
  };

  const filtered = onSearch
    ? data
    : data.filter((row) =>
        columns.some((col) => {
          const val = typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor];
          return String(val ?? '').toLowerCase().includes(search.toLowerCase());
        })
      );

  const totalItems = total ?? filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginated = onPageChange
    ? filtered
    : filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-lg font-bold text-slate-900 font-display">{title}</h2>}
            {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {searchable && (
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input
                  value={search}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48"
                />
              </div>
            )}
            {filters}
            {exportable && (
              <>
                <button
                  onClick={() => exportToCSV(filtered, columns, `${title || 'data'}.csv`)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"
                >
                  <FiDownload size={14} /> CSV
                </button>
                <button
                  onClick={() => exportToExcel(filtered, columns, `${title || 'data'}.xls`)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100"
                >
                  <FiDownload size={14} /> Excel
                </button>
              </>
            )}
          </div>
        </div>
        {bulkActions && selectedRows?.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500">{selectedRows.length} selected</span>
            {bulkActions}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50/80">
              {onSelectRow && (
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" onChange={onSelectAll} className="rounded" />
                </th>
              )}
              {columns.map((col) => (
                <th key={col.header} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {col.header}
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-t border-slate-50">
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-3">
                      <Skeleton width="80%" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-12 text-center text-sm text-slate-400">
                  No data found
                </td>
              </tr>
            ) : (
              paginated.map((row, idx) => (
                <motion.tr
                  key={row.id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  className="border-t border-slate-50 hover:bg-blue-50/30 transition-colors"
                >
                  {onSelectRow && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows?.includes(row.id)}
                        onChange={() => onSelectRow(row.id)}
                        className="rounded"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.header} className="px-4 py-3 text-sm text-slate-700">
                      {col.render ? col.render(row) : (typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor])}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">{actions(row)}</div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalItems)} of {totalItems}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage <= 1}
              onClick={() => setPage(currentPage - 1)}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 text-slate-600"
            >
              <FiChevronLeft size={16} />
            </button>
            <span className="px-3 text-xs font-semibold text-slate-600">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="p-2 rounded-lg hover:bg-slate-100 disabled:opacity-40 text-slate-600"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    BLOCKED: 'bg-red-50 text-red-700 border-red-200',
    SUSPENDED: 'bg-red-50 text-red-700 border-red-200',
    CANCELLED: 'bg-slate-100 text-slate-600 border-slate-200',
    IN_PROGRESS: 'bg-violet-50 text-violet-700 border-violet-200',
    ACTIVE_CONSULTATION: 'bg-violet-50 text-violet-700 border-violet-200',
    SUCCESS: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    FAILED: 'bg-red-50 text-red-700 border-red-200',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${styles[status] || 'bg-slate-50 text-slate-600 border-slate-200'}`}>
      {status}
    </span>
  );
}

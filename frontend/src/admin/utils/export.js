export const exportToCSV = (data, columns, filename = 'export.csv') => {
  const headers = columns.map((c) => c.header).join(',');
  const rows = data.map((row) =>
    columns.map((c) => {
      const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor];
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

export const exportToExcel = (data, columns, filename = 'export.xls') => {
  const headers = columns.map((c) => `<th>${c.header}</th>`).join('');
  const rows = data.map((row) => {
    const cells = columns.map((c) => {
      const val = typeof c.accessor === 'function' ? c.accessor(row) : row[c.accessor];
      return `<td>${val ?? ''}</td>`;
    }).join('');
    return `<tr>${cells}</tr>`;
  }).join('');
  const html = `<table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
};

import LoadingSpinner from './LoadingSpinner';

export default function Table({ columns, data, loading, emptyMessage = 'No records found' }) {
  if (loading) return <LoadingSpinner />;

  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key || col.label} className={col.className || ''}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-14 text-gray-400 dark:text-slate-500">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl">📭</span>
                  <span className="text-sm">{emptyMessage}</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row._id || idx}>
                {columns.map((col) => (
                  <td key={col.key || col.label} className={col.tdClassName || ''}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

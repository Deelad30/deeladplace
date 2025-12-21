export default function TableSkeleton({ columns, rows = 20 }) {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <tr key={i} className="skeleton-row">
            {columns.map(col => (
              <td key={col.key}>
                <div className="skeleton-cell" />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

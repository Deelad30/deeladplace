import React from 'react';

export default function Table({ columns, data }) {
  if (data.length === 0) {
    return <div className="empty-state">No records found</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.key}>{col.label}</th>
          ))}
        </tr>
      </thead>

      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {columns.map(col => (
              <td key={col.key}>

                {/* If this column uses custom render() */}
                {col.render
                  ? col.render(row)

                  /* Otherwise show plain value */
                  : row[col.key]}

              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

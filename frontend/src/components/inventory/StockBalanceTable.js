import React, { useEffect, useState } from 'react';
import { getStockBalance } from '../../api/inventoryLedger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

const StockBalanceTable = ({ limit, refreshTrigger, highlightId }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Ref to store row elements: { [id]: element }
  const rowRefs = React.useRef({});

  useEffect(() => {
    loadData();
  }, [refreshTrigger]);

  useEffect(() => {
    // Handle scrolling when data or highlightId changes
    if (highlightId && data.length > 0) {
        const row = rowRefs.current[highlightId];
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
  }, [highlightId, data]);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getStockBalance();
      setData(res.data.stock || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { 
      key: 'name', 
      label: 'Item Name',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
              width: '40px', height: '40px', 
              borderRadius: '12px', 
              background: row.is_low_stock ? '#fee2e2' : '#dcfce7',
              color: row.is_low_stock ? '#ef4444' : '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '800', fontSize: '16px'
          }}>
              {row.name.charAt(0)}
          </div>
          <div>
            <span style={{ fontWeight: '700', color: '#1e293b', fontSize: '15px', display: 'block' }}>{row.name}</span>
            <div style={{ fontSize: '12px', color: '#64748b' }}>{row.measurement_unit}</div>
          </div>
        </div>
      )
    },
    { 
      key: 'current_stock', 
      label: 'Stock Level',
      render: (row) => {
          const val = Number(row.current_stock);
          const min = Number(row.min_stock_level || 10); 
          const pct = Math.min((val / (min * 3)) * 100, 100); // Visual scaling

          return (
            <div style={{ width: '100%', minWidth: '180px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                     <span style={{ fontWeight: '700', fontSize: '14px', color: '#334155' }}>{val.toFixed(2)}</span>
                     <span style={{ fontSize: '12px', color: '#94a3b8' }}>Min: {min}</span>
                </div>
                <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                        height: '100%', 
                        width: `${pct}%`, 
                        background: row.is_low_stock ? '#ef4444' : '#22c55e',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                    }}></div>
                </div>
            </div>
          );
      }
    },
    { 
      key: 'average_cost', 
      label: 'Avg Cost',
      render: (row) => (
          <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
              ₦{Number(row.average_cost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
      )
    },
    { 
        key: 'value', 
        label: 'Total Value',
        render: (row) => {
            const val = Number(row.current_stock) * Number(row.average_cost);
            return <span style={{ fontWeight: '700', color: '#1e293b' }}>₦{val.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>;
        }
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (row) => (
        row.is_low_stock ? (
          <span style={{ 
              background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca',
              padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <FontAwesomeIcon icon={faExclamationCircle} />
            Low Stock
          </span>
        ) : (
          <span style={{ 
              background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0',
              padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
              display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            <FontAwesomeIcon icon={faCheckCircle} />
            Healthy
          </span>
        )
      )
    }
  ];

  if (loading) return (
      <div className="premium-card">
          <div className="skeleton-line" style={{ height: '40px', marginBottom: '20px' }}></div>
          <div className="skeleton-box" style={{ height: '300px' }}></div>
      </div>
  );

  return (
    <div className="premium-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <div>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Stock Balance</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#64748b' }}>Real-time inventory levels</p>
        </div>
        <button 
            className="item-action-btn view" 
            onClick={loadData}
            title="Refresh"
        >
            <FontAwesomeIcon icon={faHistory} /> Refresh
        </button>
      </div>

      <div className="table-container" style={{ marginTop: 0, border: 'none', boxShadow: 'none' }}>
        
        {/* Desktop Table View */}
        <div className="premium-table-wrapper desktop-view">
            <table className="premium-table">
                <thead>
                    <tr>
                        {columns.map((col, i) => (
                            <th key={i}>{col.label}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="empty-state">
                                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
                                <div>No inventory data found</div>
                            </td>
                        </tr>
                    ) : (
                        data.map((row, i) => {
                            const isHighlighted = highlightId && (String(row.item_id) === String(highlightId) || String(row.id) === String(highlightId));
                            const highlightStyle = isHighlighted ? { background: '#fff7ed' } : {};
                            
                            return (
                                <tr 
                                    key={i} 
                                    ref={el => rowRefs.current[row.item_id || row.id] = el}
                                    style={highlightStyle}
                                >
                                    {columns.map((col, j) => (
                                        <td key={j}>
                                            {col.render ? col.render(row) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>

        {/* Mobile Card View */}
        <div className="mobile-view-cards">
            {data.length === 0 ? (
                <div className="empty-state">
                    <div style={{ fontSize: '40px', marginBottom: '10px' }}>📦</div>
                    <div>No inventory data found</div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {data.map((row, i) => (
                         <div key={i} className="premium-mobile-card" style={{
                             background: 'white',
                             padding: '16px',
                             borderRadius: '12px',
                             border: '1px solid #e2e8f0',
                             boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                         }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{row.name}</div>
                                {row.is_low_stock && (
                                    <span style={{ 
                                        fontSize: '11px', background: '#fef2f2', color: '#b91c1c', 
                                        padding: '2px 8px', borderRadius: '12px', border: '1px solid #fecaca' 
                                    }}>Low Stock</span>
                                )}
                             </div>
                             
                             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                                 <div>
                                     <div style={{ color: '#64748b', marginBottom: '2px' }}>Stock Level</div>
                                     <div style={{ fontWeight: '600' }}>{Number(row.current_stock).toFixed(2)} {row.measurement_unit}</div>
                                 </div>
                                 <div>
                                     <div style={{ color: '#64748b', marginBottom: '2px' }}>Avg Cost</div>
                                     <div style={{ fontWeight: '600' }}>₦{Number(row.average_cost).toLocaleString()}</div>
                                 </div>
                                 <div style={{ gridColumn: 'span 2' }}>
                                     <div style={{ color: '#64748b', marginBottom: '2px' }}>Total Value</div>
                                     <div style={{ fontWeight: '700', color: '#0f172a' }}>
                                        ₦{(Number(row.current_stock) * Number(row.average_cost)).toLocaleString()}
                                     </div>
                                 </div>
                             </div>
                         </div>
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

export default StockBalanceTable;

import React, { useState, useEffect } from 'react';
import { getLedger } from '../../api/inventoryLedger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHistory } from '@fortawesome/free-solid-svg-icons';

const StockMovementLog = () => {
    const [movements, setMovements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [vendorFilter, setVendorFilter] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await getLedger();
            setMovements(res.data.movements || []);
        } catch (err) {
            console.error("Failed to load ledger", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredMovements = movements.filter(m => {
        const moveDate = new Date(m.created_at);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        // Date Range
        if (start && moveDate < start) return false;
        if (end) {
            end.setHours(23, 59, 59); // Include full end day
            if (moveDate > end) return false;
        }

        // Vendor/Source Filter
        if (vendorFilter) {
            const search = vendorFilter.toLowerCase();
            const source = (m.source || '').toLowerCase();
            const dest = (m.destination || '').toLowerCase();
            const items = (m.item_name || '').toLowerCase();
            if (!source.includes(search) && !dest.includes(search) && !items.includes(search)) return false;
        }

        return true;
    });

    if (loading) return <div className="skeleton-row" style={{ height: '300px' }}></div>;

    return (
        <div style={{ background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 4px 25px rgba(0,0,0,0.05)', border: '1px solid #f8fafc' }}>
            <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                 <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>Stock Movement Log</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#94a3b8' }}>Detailed history of all inflows, outflows, and waste</p>
                </div>
                
                {/* Filters */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input 
                        type="date" 
                        value={startDate} 
                        onChange={e => setStartDate(e.target.value)}
                        style={inputStyle}
                        title="Start Date"
                    />
                    <span style={{ color: '#94a3b8' }}>-</span>
                    <input 
                        type="date" 
                        value={endDate} 
                        onChange={e => setEndDate(e.target.value)}
                        style={inputStyle}
                        title="End Date"
                    />
                    <input 
                        type="text" 
                        placeholder="Filter by Item..." 
                        value={vendorFilter}
                        onChange={e => setVendorFilter(e.target.value)}
                        style={{ ...inputStyle, width: '200px' }}
                    />
                    <button 
                        className="btn btn-secondary" 
                        onClick={loadData}
                        style={{ background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: '600', fontSize: '13px' }}
                    >
                        <FontAwesomeIcon icon={faHistory} />
                    </button>
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 10px' }}>
                    <thead>
                        <tr>
                            {['Date', 'User', 'Item', 'Type', 'Qty', 'Source / From', 'Destination / To', 'Notes'].map((h, i) => (
                                <th key={i} style={{ padding: '0 15px 10px 15px', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: '700', letterSpacing: '0.5px' }}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMovements.map((move, i) => {
                            const isIn = move.movement_type === 'in';
                            const isOut = move.movement_type === 'out';
                            
                            return (
                                <tr key={i} style={{ background: 'white', transition: 'all 0.2s' }}>
                                    <td style={tdStyle}>{new Date(move.created_at).toLocaleDateString()} <span style={{ color: '#cbd5e1' }}>{new Date(move.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span></td>
                                    
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', color: '#64748b', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                                {(move.created_by_name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <span style={{ fontWeight: '500', color: '#475569', fontSize: '13px', textTransform: 'capitalize' }}>
                                                {move.created_by_name || 'Unknown User'}
                                            </span>
                                        </div>
                                    </td>

                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: '600', color: '#334155' }}>{move.item_name}</span>
                                    </td>

                                    <td style={tdStyle}>
                                        <span style={{ 
                                            padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700',
                                            background: move.movement_type === 'in' ? '#dcfce7' : move.movement_type === 'out' ? '#f1f5f9' : '#fee2e2',
                                            color: move.movement_type === 'in' ? '#16a34a' : move.movement_type === 'out' ? '#64748b' : '#ef4444'
                                        }}>
                                            {move.movement_type === 'in' ? 'INBOUND' : move.movement_type === 'out' ? 'OUTBOUND' : 'WASTE'}
                                        </span>
                                    </td>

                                    <td style={tdStyle}>
                                        <span style={{ fontWeight: '700', color: move.movement_type === 'in' ? '#16a34a' : '#ef4444' }}>
                                            {move.movement_type === 'in' ? '+' : '-'}{Math.abs(Number(move.qty)).toFixed(2)} {move.measurement_unit}
                                        </span>
                                    </td>

                                    <td style={tdStyle}>{move.source || <span style={{ color: '#cbd5e1' }}>-</span>}</td>
                                    <td style={tdStyle}>{move.destination || <span style={{ color: '#cbd5e1' }}>-</span>}</td>
                                    
                                    <td style={tdStyle}>
                                        {move.notes ? (
                                            <span style={{ fontSize: '12px', color: '#475569', fontStyle: 'italic' }}>"{move.notes}"</span>
                                        ) : <span style={{ color: '#cbd5e1' }}>-</span>}
                                    </td>
                                </tr>
                            );
                        })}
                         {filteredMovements.length === 0 && (
                            <tr>
                                <td colSpan={8} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>No movements matches filters.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const inputStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
    fontSize: '13px',
    outline: 'none',
    color: '#334155'
};

const tdStyle = {
    padding: '16px', 
    fontSize: '13px', 
    color: '#334155',
    borderTop: '1px solid #f1f5f9', 
    borderBottom: '1px solid #f1f5f9'
};

export default StockMovementLog;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMaterials } from '../../api/materials';
import { recordMovement } from '../../api/inventoryLedger';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExchangeAlt, faArrowDown, faArrowUp, faTrash } from '@fortawesome/free-solid-svg-icons';

const StockLedgerForm = ({ onSuccess }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    item_id: '',
    movement_type: 'in', // in, out, waste
    qty: '',
    cost_per_unit: '', // New field
    date: new Date().toISOString().split('T')[0],
    source: '',      // e.g. Vendor Name
    destination: '', // e.g. Kitchen
    notes: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    try {
        const res = await getMaterials();
        const data = res.data;
        if (Array.isArray(data)) {
            setItems(data);
        } else if (data && Array.isArray(data.items)) {
            setItems(data.items);
        } else if (data && Array.isArray(data.materials)) {
            setItems(data.materials);
        } else {
            setItems([]);
        }
    } catch (err) {
        console.error("Failed to load items", err);
        setItems([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.item_id || !form.qty || !form.source) {
        toast.error("Please fill in required fields (Item, Qty, Source/Dest)");
        return;
    }

    setLoading(true);
    try {
        await recordMovement({
            item_id: form.item_id,
            item_type: 'material',
            movement_type: form.movement_type,
            qty: Number(form.qty),
            cost_per_unit: form.movement_type === 'in' ? Number(form.cost_per_unit) : null,
            source: form.source,
            destination: form.destination || (form.movement_type === 'in' ? 'Store' : 'Kitchen'),
            notes: form.notes,
        });
        
        toast.success("Movement recorded successfully");
        setForm({ ...form, qty: '', cost_per_unit: '', notes: '', source: '', destination: '' });
        if (onSuccess) onSuccess();
    } catch (err) {
        toast.error(err.response?.data?.message || "Failed to record movement");
    } finally {
        setLoading(false);
    }
  };

  // Filter items
  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(form.searchTerm?.toLowerCase() || '')
  );

  return (
    <div id="ledger-form" className="premium-card">
        <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'yellow' }}>New Stock Entry</h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#fff' }}>Log inbound supplies, outbound usage, or waste.</p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ gap: '24px' }}>
            
            {/* Type Selection */}
            <div className="form-group full-width">
                <label style={{color:"yellow"}} className="premium-label">Movement Type</label>
                <div className="movement-grid">
                    {[
                        { id: 'in', label: 'Inbound', icon: faArrowDown, color: '#22c55e', bg: '#dcfce7' },
                        { id: 'out', label: 'Outbound', icon: faArrowUp, color: '#3b82f6', bg: '#dbeafe' },
                        { id: 'waste', label: 'Waste', icon: faTrash, color: '#ef4444', bg: '#fee2e2' }
                    ].map(type => {
                        const active = form.movement_type === type.id;
                        return (
                            <button
                                type="button"
                                key={type.id}
                                onClick={() => setForm({ ...form, movement_type: type.id })}
                                style={{
                                    padding: '12px',
                                    borderRadius: '10px',
                                    border: active ? `2px solid ${type.color}` : '2px solid transparent',
                                    background: active ? type.bg : '#f8fafc',
                                    color: active ? type.color : '#64748b',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <FontAwesomeIcon icon={type.icon} />
                                {type.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Item Selection (Searchable) */}
            <div className="form-group full-width">
                <label style={{color:"yellow"}} className="premium-label">Select Item</label>
                <div style={{ position: 'relative' }}>
                    <input 
                        className="premium-input"
                        type="text"
                        placeholder="Search item name..."
                        value={form.searchTerm || ''}
                        onChange={e => setForm({...form, searchTerm: e.target.value})}
                        style={{ marginBottom: '8px' }}
                    />
                    
                    {/* Compact Item Grid */}
                    <div style={{ 
                        maxHeight: '200px', 
                        overflowY: 'auto', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '12px', 
                        padding: '8px',
                        background: '#f8fafc',
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                        gap: '8px'
                    }}>
                        {filteredItems.map(item => {
                            const isSelected = String(form.item_id) === String(item.id);
                            return (
                                <div 
                                    key={item.id}
                                    onClick={() => setForm({...form, item_id: item.id})}
                                    style={{
                                        background: isSelected ? 'white' : 'white',
                                        border: isSelected ? '2px solid #d91f22' : '1px solid #e2e8f0',
                                        boxShadow: isSelected ? '0 0 0 2px rgba(217,31,34,0.1)' : 'none',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        opacity: isSelected ? 1 : 0.8
                                    }}
                                >
                                    <div style={{ fontSize: '13px', fontWeight: '700', color: isSelected ? '#d91f22' : '#334155' }}>
                                        {item.name}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                                        {item.measurement_unit}
                                    </div>
                                </div>
                            );
                        })}
                        {filteredItems.length === 0 && <div style={{gridColumn:'1/-1', padding:'10px', textAlign:'center', fontSize:'13px', color:'#94a3b8'}}>No items found</div>}
                    </div>
                </div>
            </div>

            {/* Date & Qty */}
            <div className="form-group">
                <label style={{color:"yellow"}} className="premium-label">Date</label>
                <input 
                    className="premium-input"
                    type="date" 
                    value={form.date}
                    onChange={e => setForm({...form, date: e.target.value})}
                />
            </div>
            <div className="form-group">
                <label className="premium-label">Quantity</label>
                <input 
                    className="premium-input"
                    type="number" step="0.01"
                    placeholder="0.00"
                    value={form.qty}
                    onChange={e => setForm({...form, qty: e.target.value})}
                />
            </div>

            {form.movement_type === 'in' && (
                <div className="form-group">
                    <label style={{color:"yellow"}} className="premium-label">Unit Cost (₦)</label>
                    <input 
                        className="premium-input"
                        type="number" step="0.01"
                        placeholder="0.00"
                        value={form.cost_per_unit}
                        onChange={e => setForm({...form, cost_per_unit: e.target.value})}
                    />
                </div>
            )}

            {/* Source & Dest */}
            <div className="form-group">
                 <label className="premium-label">
                    {form.movement_type === 'in' ? 'Source (Vendor)' : 'Source (From)'}
                 </label>
                 <input 
                    className="premium-input"
                    type="text" 
                    placeholder={form.movement_type === 'in' ? "e.g. Market" : "e.g. Main Store"}
                    value={form.source}
                    onChange={e => setForm({...form, source: e.target.value})}
                 />
            </div>

            <div className="form-group">
                 <label className="premium-label">
                    {form.movement_type === 'in' ? 'Destination (To)' : 'Destination (To)'}
                 </label>
                 <input 
                    className="premium-input"
                    type="text" 
                    placeholder={form.movement_type === 'in' ? "e.g. Main Store" : "e.g. Kitchen"}
                    value={form.destination}
                    onChange={e => setForm({...form, destination: e.target.value})}
                 />
            </div>

            <div className="form-group full-width">
                <label className="premium-label">Notes (Optional)</label>
                <textarea 
                    className="premium-input"
                    style={{ minHeight: '80px' }}
                    placeholder="Any specific details..."
                    value={form.notes}
                    onChange={e => setForm({...form, notes: e.target.value})}
                />
            </div>

            <div className="form-group full-width">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="submit-btn"
                >
                    {loading ? 'Recording...' : 'Record Movement'}
                </button>
            </div>

        </form>
    </div>
  );
};

export default StockLedgerForm;

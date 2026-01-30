import React, { useEffect, useState } from 'react';
import TableSkeleton from '../common/TableSkeleton';
import PageHeader from '../common/PageHeader';
import Modal from '../common/Modal'; // Standard Modal
import toast from 'react-hot-toast';

import { getOpex, createOpex, updateOpex, deleteOpex } from '../../api/opex';
import '../../styles/shared/PremiumShared.css'; // Shared Premium Styles

export default function OpexPage() {
  const [loading, setLoading] = useState(true);
  const [opexList, setOpexList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [lastAdded, setLastAdded] = useState(null); // Success feedback

  const [form, setForm] = useState({
    name: '',
    allocation_mode: 'fixed',
    estimated_monthly_sales: '',
    amount: '',
    percentage_value: '',
    effective_from: '',
    effective_to: ''
  });

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Convert ISO string to YYYY-MM-DD for modal input
  function formatDateForInputLocal(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Convert ISO string to MM/DD/YYYY for table display
  function formatDateDisplay(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  // Load OPEX records
  async function loadOpex() {
    setLoading(true);
    try {
      const res = await getOpex();
      setOpexList(res.data.opex || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load OPEX records.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOpex();
  }, []);

  // Save OPEX (add or update)
  const handleSave = async () => {
    if (!form.name.trim() || !form.allocation_mode) {
      toast.error("Name and allocation mode are required.");
      return;
    }

    setLoadingAction(true);
    const payload = {
      ...form,
      amount: form.allocation_mode === "fixed" ? Number(form.amount || 0) : null,
      percentage_value: form.allocation_mode === "percent_of_cogs" ? Number(form.percentage_value || 0) : null,
      effective_from: form.effective_from || null,
      effective_to: form.effective_to || null,
    };

    try {
      if (editingId) {
        await updateOpex(editingId, payload);
        toast.success("OPEX updated successfully");
        setEditingId(null);
        setOpenModal(false);
        setForm({
          name: '',
          allocation_mode: 'fixed',
          amount: '',
          percentage_value: '',
          effective_from: '',
          effective_to: '',
          estimated_monthly_sales: ''
        });
      } else {
        await createOpex(payload);
        toast.success("OPEX added. Add another?");
        setLastAdded(form.name);
        
        // Reset form, keep dates/mode
        setForm(f => ({
          ...f,
          name: '',
          amount: '',
          percentage_value: '',
          estimated_monthly_sales: ''
          // allocation_mode, dates retained
        }));
        
        loadOpex();
        return; // Keep open
      }
      loadOpex();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save OPEX item");
    } finally {
      setLoadingAction(false);
    }
  };

  // Edit OPEX
  function handleEdit(record) {
    setEditingId(record.id);
    setForm({
      name: record.name,
      allocation_mode: record.allocation_mode,
      estimated_monthly_sales: record.estimated_monthly_sales,
      amount: record.amount || '',
      percentage_value: record.percentage_value || '',
      effective_from: formatDateForInputLocal(record.effective_from),
      effective_to: formatDateForInputLocal(record.effective_to)
    });
    setOpenModal(true);
  }

  // Delete OPEX
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this OPEX record?")) return;
    
    setLoadingAction(true);
    try {
      await deleteOpex(id);
      toast.success('OPEX record deleted.');
      loadOpex();
    } catch (err) {
      toast.error('Failed to delete OPEX record.');
    } finally {
      setLoadingAction(false);
    }
  }

  // Filter and paginate
  const filtered = opexList.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    (o.amount && String(o.amount).includes(search))
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="page-container">
      {/* Loading Overlay */}
      {loadingAction && (
        <div className="loading-overlay">
            <div className="spinner"></div>
        </div>
      )}

      {/* Header Actions */}
      <div className="page-header-actions">
        <input
            type="text"
            className="search-bar"
            placeholder="Search OPEX..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
        />
        <button className="premium-btn primary" onClick={() => {
            setOpenModal(true);
            setEditingId(null);
            setForm({
                name: '',
                allocation_mode: 'fixed',
                estimated_monthly_sales: '',
                amount: '',
                percentage_value: '',
                effective_from: '',
                effective_to: ''
            });
        }}>
            + Add Expenses
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={[{key:'1'},{key:'2'},{key:'3'},{key:'4'},{key:'5'},{key:'6'},{key:'7'}]} rows={10} />
      ) : (
        <div className="table-container">
           <table className="premium-table">
            <thead>
                <tr>
                    <th>Expense Name</th>
                    <th>Mode</th>
                    <th>Amount / (%)</th>
                    <th>Monthly Sales</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {paginated.length === 0 ? (
                    <tr><td colSpan="7" className="empty-state">No OPEX records found.</td></tr>
                ) : (
                    paginated.map(o => (
                        <tr key={o.id}>
                            <td style={{fontWeight: '600', color: '#0f172a'}}>{o.name}</td>
                            <td>
                                <span style={{
                                    background: o.allocation_mode === 'fixed' ? '#eef2ff' : '#fff7ed',
                                    color: o.allocation_mode === 'fixed' ? '#4f46e5' : '#ea580c',
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '13px', textTransform: 'capitalize'
                                }}>
                                    {o.allocation_mode === 'percent_of_cogs' ? '% COGS' : 'Fixed'}
                                </span>
                            </td>
                            <td>
                                {o.allocation_mode === 'fixed' 
                                    ? `₦${Number(o.amount).toLocaleString()}` 
                                    : `${o.percentage_value}%`}
                            </td>
                            <td>{o.estimated_monthly_sales ? Number(o.estimated_monthly_sales).toLocaleString() : '-'}</td>
                            <td>{formatDateDisplay(o.effective_from)}</td>
                            <td>{formatDateDisplay(o.effective_to)}</td>
                            <td style={{textAlign: 'right'}}>
                                <button className="item-action-btn edit" onClick={() => handleEdit(o)}>Edit</button>
                                <button className="item-action-btn delete" onClick={() => handleDelete(o.id)}>Delete</button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
           </table>

           {/* Pagination */}
           {filtered.length > ITEMS_PER_PAGE && (
            <div className="pagination-container">
                <button 
                  className="page-btn"
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={currentPage === 1}
                >Previous</button>
                <span style={{fontSize: '14px', color: '#64748b'}}>Page {currentPage} of {totalPages}</span>
                <button 
                  className="page-btn" 
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage === totalPages}
                >Next</button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        visible={openModal}
        onClose={() => setOpenModal(false)}
        title={editingId ? 'Edit OPEX' : 'New Operational Expense'}
      >
        <div className="vendor-form">
            
             {/* Success Banner */}
            {lastAdded && !editingId && (
                <div style={{
                    marginBottom: '16px',
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#166534',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span style={{fontSize: '18px'}}>✓</span>
                    <div>
                        <strong>Success!</strong> Added <u>{lastAdded}</u>.
                        <div style={{fontSize: '12px', marginTop: '2px', opacity: 0.9}}>Ready for next item...</div>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px' }}>
                <div className="form-group">
                    <label className="premium-label-2">Expense Name</label>
                    <input
                        className="premium-input"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        placeholder="e.g. Rent, Utilities..."
                        autoFocus
                    />
                </div>

                <div className="form-group">
                    <label className="premium-label-2">Allocation Mode</label>
                    <select
                        className="premium-input"
                        value={form.allocation_mode}
                        onChange={e => setForm({ ...form, allocation_mode: e.target.value })}
                    >
                        <option value="fixed">Fixed Amount</option>
                        <option value="percent_of_cogs">% of COGS</option>
                    </select>
                </div>


                {form.allocation_mode === 'fixed' && (
                <div className="form-group">
                    <label className="premium-label-2">Fixed Amount (₦)</label>
                    <input
                    className="premium-input"
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                    />
                </div>
                )}

                {form.allocation_mode === 'percent_of_cogs' && (
                <div className="form-group">
                    <label className="premium-label-2">Percentage Value (%)</label>
                    <input
                    className="premium-input"
                    type="number"
                    value={form.percentage_value}
                    onChange={e => setForm({ ...form, percentage_value: e.target.value })}
                    placeholder="e.g. 5"
                    />
                </div>
                )}

                <div className="form-group">
                    <label className="premium-label-2">Estimated Monthly Sales</label>
                    <input
                        className="premium-input"
                        type="number"
                        value={form.estimated_monthly_sales}
                        onChange={e => setForm({ ...form, estimated_monthly_sales: e.target.value })}
                        placeholder="Optional"
                    />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="premium-label-2">Start Date</label>
                        <input
                            className="premium-input"
                            type="date"
                            value={form.effective_from}
                            onChange={e => setForm({ ...form, effective_from: e.target.value })}
                        />
                    </div>
                    <div className="form-group">
                        <label className="premium-label-2">End Date</label>
                        <input
                            className="premium-input"
                            type="date"
                            value={form.effective_to}
                            onChange={e => setForm({ ...form, effective_to: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            <button className="submit-btn full-width" onClick={handleSave} disabled={loadingAction} style={{marginTop: '20px'}}>
                {loadingAction ? "Saving..." : (editingId ? "Update Expense" : "Add Expense")}
            </button>
        </div>
      </Modal>
    </div>
  );
}

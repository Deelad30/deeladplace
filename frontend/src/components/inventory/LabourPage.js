import React, { useEffect, useState } from 'react';
import TableSkeleton from '../common/TableSkeleton';
import PageHeader from '../common/PageHeader';
import Modal from '../common/Modal'; // Standard Modal
import toast from 'react-hot-toast';

import { getLabour, createLabour, updateLabour, deleteLabour } from '../../api/labour';
import '../../styles/shared/PremiumShared.css'; // Shared Premium Styles

export default function LabourPage() {
  const [loading, setLoading] = useState(true);
  const [labourList, setLabourList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const [form, setForm] = useState({
    name: '',
    amount: '',
    allocation_type: 'fixed',
    estimated_monthly_sales: '',
    start_date: '',
    end_date: ''
  });

  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Convert ISO string to YYYY-MM-DD for <input type="date">
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

  async function loadLabour() {
    setLoading(true);
    try {
      const res = await getLabour();
      setLabourList(res.data.labour || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load labour records.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLabour();
  }, []);

  async function handleSave() {
    if (!form.name.trim() || !form.amount || !form.allocation_type) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoadingAction(true);
    try {
      if (editingId) {
        await updateLabour(editingId, form);
        toast.success('Labour record updated.');
      } else {
        await createLabour(form);
        toast.success('Labour record added.');
      }
      setForm({ name: '', amount: '', allocation_type: 'fixed', estimated_monthly_sales: '', start_date: '', end_date: '' });
      setOpenModal(false);
      setEditingId(null);
      loadLabour();
    } catch (err) {
      console.log(err);
      toast.error('Error saving labour record.');
    } finally {
      setLoadingAction(false);
    }
  }

  function handleEdit(record) {
    setEditingId(record.id);
    setForm({
      name: record.name,
      amount: record.amount,
      allocation_type: record.allocation_type,
      estimated_monthly_sales: record.estimated_monthly_sales || '' ,
      start_date: formatDateForInputLocal(record.start_date),
      end_date: formatDateForInputLocal(record.end_date)
    });
    setOpenModal(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    
    setLoadingAction(true);
    try {
      await deleteLabour(id);
      toast.success('Labour record deleted.');
      loadLabour();
    } catch (err) {
      toast.error('Failed to delete labour record.');
    } finally {
      setLoadingAction(false);
    }
  }

  // Filter
  const filtered = labourList.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    String(l.amount).includes(search)
  );

  // Pagination
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
            placeholder="Search labour..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
        />
        <button className="premium-btn primary" onClick={() => {
            setOpenModal(true);
            setEditingId(null);
            setForm({ name: '', amount: '', allocation_type: 'fixed', estimated_monthly_sales: '', start_date: '', end_date: '' });
        }}>
            + Add Labour
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={[{key:'1'},{key:'2'},{key:'3'},{key:'4'},{key:'5'},{key:'6'},{key:'7'}]} rows={10} />
      ) : (
        <div className="table-container">
           <table className="premium-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Monthly Sales</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {paginated.length === 0 ? (
                    <tr><td colSpan="7" className="empty-state">No labour records found.</td></tr>
                ) : (
                    paginated.map(l => (
                        <tr key={l.id}>
                            <td style={{fontWeight: '600', color: '#0f172a'}}>{l.name}</td>
                            <td>₦{Number(l.amount).toLocaleString()}</td>
                            <td>
                                <span style={{
                                    background: l.allocation_type === 'fixed' ? '#eef2ff' : '#f0fdf4',
                                    color: l.allocation_type === 'fixed' ? '#4f46e5' : '#166534',
                                    padding: '4px 8px', borderRadius: '6px', fontSize: '13px', textTransform: 'capitalize'
                                }}>
                                    {l.allocation_type}
                                </span>
                            </td>
                            <td>{l.estimated_monthly_sales ? Number(l.estimated_monthly_sales).toLocaleString() : '-'}</td>
                            <td>{formatDateDisplay(l.start_date)}</td>
                            <td>{formatDateDisplay(l.end_date)}</td>
                            <td style={{textAlign: 'right'}}>
                                <button className="item-action-btn edit" onClick={() => handleEdit(l)}>Edit</button>
                                <button className="item-action-btn delete" onClick={() => handleDelete(l.id)}>Delete</button>
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
        title={editingId ? 'Edit Labour' : 'New Labour'}
      >
        <div className="vendor-form">
            <div className="form-group">
                <label className="premium-label">Name</label>
                <input
                    className="premium-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Chef, cleaner..."
                />
            </div>

            <div className="form-group">
                <label className="premium-label">Amount (₦)</label>
                <input
                    className="premium-input"
                    type="number"
                    value={form.amount}
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    placeholder="0.00"
                />
            </div>

            <div className="form-group">
                <label className="premium-label">Allocation Type</label>
                <select
                    className="premium-input"
                    value={form.allocation_type}
                    onChange={e => setForm({ ...form, allocation_type: e.target.value })}
                >
                    <option value="fixed">Fixed</option>
                    {/* Add other types if backend supports them */}
                </select>
            </div>

            <div className="form-group">
                <label className="premium-label">Estimated Monthly Sales (For Reporting)</label>
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
                    <label className="premium-label">Start Date</label>
                    <input
                        className="premium-input"
                        type="date"
                        value={form.start_date}
                        onChange={e => setForm({ ...form, start_date: e.target.value })}
                    />
                </div>
                <div className="form-group">
                    <label className="premium-label">End Date</label>
                    <input
                        className="premium-input"
                        type="date"
                        value={form.end_date}
                        onChange={e => setForm({ ...form, end_date: e.target.value })}
                    />
                </div>
            </div>

            <button className="submit-btn full-width" onClick={handleSave} disabled={loadingAction} style={{marginTop: '20px'}}>
                {loadingAction ? "Saving..." : (editingId ? "Update" : "Save")}
            </button>
        </div>
      </Modal>
    </div>
  );
}

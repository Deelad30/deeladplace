import React, { useEffect, useState } from 'react';
import TableSkeleton from '../common/TableSkeleton';
import PageHeader from '../common/PageHeader';
import Modal from '../common/Modal'; // Standard Modal
import {
  getPackaging,
  createPackaging,
  updatePackaging,
  deletePackaging
} from '../../api/packaging.services';
import toast from 'react-hot-toast';
import '../../styles/shared/PremiumShared.css'; // Shared Premium Styles

export default function PackagingPage() {
  const [loading, setLoading] = useState(true);
  const [packaging, setPackaging] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [lastAdded, setLastAdded] = useState(null); // Success feedback
  
  // Form state now includes helpers for calculation
  const [form, setForm] = useState({ 
      name: '', 
      total_cost: '', 
      input_qty: '1',
      cost_per_unit: '' // Calculated
  });

  // Effect to calculate unit cost automatically
  useEffect(() => {
    const total = parseFloat(form.total_cost) || 0;
    const qty = parseFloat(form.input_qty) || 1;
    if (qty > 0) {
        setForm(f => ({ ...f, cost_per_unit: (total / qty).toFixed(2) }));
    }
  }, [form.total_cost, form.input_qty]);

  // Search + Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  async function loadPackaging() {
    setLoading(true);
    try {
      const res = await getPackaging();
      setPackaging(res.data.packaging || []);
    } catch (err) {
      toast.error('Failed to load packaging.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPackaging();
  }, []);

  async function handleSave() {
    if (!form.name.trim() || !form.cost_per_unit) {
      toast.error('Please fill all fields.');
      return;
    }

    setLoadingAction(true);
    try {
      const payload = {
          name: form.name,
          cost_per_unit: form.cost_per_unit
      };

      if (editingId) {
        await updatePackaging(editingId, payload);
        toast.success('Packaging updated.');
        setOpenModal(false);
        setEditingId(null);
      } else {
        await createPackaging(payload);
        toast.success('Packaging added. Add another?');
        setLastAdded(form.name);
        
        // Reset form for next entry
        setForm({ 
            name: '', 
            total_cost: '', 
            input_qty: '1',
            cost_per_unit: '' 
        });
        // Keep modal open
        return; // Early return to skip closing modal
      }

      loadPackaging();
    } catch (err) {
      toast.error('Error saving packaging.');
    } finally {
      setLoadingAction(false);
      if (editingId) loadPackaging(); // Reload if we edited and closed
      // If created, we didn't close, but ideally we should refresh the list in background or just wait. 
      // Actually, we should reload to show it in table if it's visible.
      if (!editingId) loadPackaging();
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setLastAdded(null);
    // Reverse engineer: Set total cost = unit cost, qty = 1
    const unitCost = item.cost_per_unit;
    setForm({
      name: item.name,
      total_cost: unitCost,
      input_qty: '1',
      cost_per_unit: unitCost
    });
    setOpenModal(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this packaging item?")) return;

    setLoadingAction(true);
    try {
      await deletePackaging(id);
      toast.success('Packaging deleted.');
      loadPackaging();
    } catch (err) {
      toast.error('Failed to delete packaging.');
    } finally {
      setLoadingAction(false);
    }
  }

  // Filter
  const filtered = packaging.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
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
            placeholder="Search packaging..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
        />
        <button className="premium-btn primary" onClick={() => {
            setOpenModal(true);
            setEditingId(null);
            setLastAdded(null);
            setForm({ name: '', total_cost: '', input_qty: '1', cost_per_unit: '' });
        }}>
            + Add Packaging
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={[{key:'1'},{key:'2'},{key:'3'}]} rows={10} />
      ) : (
        <div className="table-container">
           <table className="premium-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Cost Per Unit (NGN)</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {paginated.length === 0 ? (
                    <tr><td colSpan="3" className="empty-state">No packaging items found.</td></tr>
                ) : (
                    paginated.map(pkg => (
                        <tr key={pkg.id}>
                            <td style={{fontWeight: '600', color: '#0f172a'}}>{pkg.name}</td>
                            <td>₦{Number(pkg.cost_per_unit).toFixed(2)}</td>
                            <td style={{textAlign: 'right'}}>
                                <button className="item-action-btn edit" onClick={() => handleEdit(pkg)}>Edit</button>
                                <button className="item-action-btn delete" onClick={() => handleDelete(pkg.id)}>Delete</button>
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
        title={editingId ? 'Edit Packaging' : 'New Packaging'}
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
                <div className="form-group full-width">
                    <label className="premium-label-2">Packaging Name</label>
                    <input
                        className="premium-input"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        required
                        placeholder="e.g. Cardboard Box"
                        autoFocus
                    />
                </div>

                <div className="form-grid">
                    <div className="form-group">
                        <label className="premium-label-2">Total Pack Cost (₦)</label>
                        <input
                            className="premium-input"
                            type="number"
                            value={form.total_cost}
                            onChange={e => setForm({ ...form, total_cost: e.target.value })}
                            required
                            placeholder="e.g. 5000"
                        />
                    </div>
                    <div className="form-group">
                        <label className="premium-label-2">Qty in Pack</label>
                        <input
                            className="premium-input"
                            type="number"
                            value={form.input_qty}
                            onChange={e => setForm({ ...form, input_qty: e.target.value })}
                            required
                            placeholder="e.g. 100"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label className="premium-label-2">Calculated Unit Cost (₦)</label>
                    <input
                        className="premium-input"
                        value={form.cost_per_unit || '0.00'}
                        disabled
                        style={{backgroundColor: '#f1f5f9', fontWeight: 'bold'}}
                    />
                    <div style={{fontSize: '12px', color: '#64748b', marginTop: '4px'}}>
                        This is the cost per single item that will be used in recipes.
                    </div>
                </div>
            </div>

            <button className="submit-btn full-width" onClick={handleSave} disabled={loadingAction} style={{marginTop: '20px'}}>
                {loadingAction ? "Saving..." : (editingId ? "Update Item" : "Add Item")}
            </button>
        </div>
      </Modal>
    </div>
  );
}

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
  
  const [form, setForm] = useState({ name: '', cost_per_unit: '' });

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
      if (editingId) {
        await updatePackaging(editingId, form);
        toast.success('Packaging updated.');
      } else {
        await createPackaging(form);
        toast.success('Packaging added.');
      }

      setOpenModal(false);
      setEditingId(null);
      setForm({ name: '', cost_per_unit: '' });
      loadPackaging();
    } catch (err) {
      toast.error('Error saving packaging.');
    } finally {
      setLoadingAction(false);
    }
  }

  function handleEdit(item) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      cost_per_unit: item.cost_per_unit
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
            setForm({ name: '', cost_per_unit: '' });
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
            <div className="form-group">
                <label className="premium-label">Packaging Name</label>
                <input
                    className="premium-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                    placeholder="e.g. Cardboard Box"
                />
            </div>

            <div className="form-group">
                <label className="premium-label">Cost Per Unit (₦)</label>
                <input
                    className="premium-input"
                    type="number"
                    value={form.cost_per_unit}
                    onChange={e => setForm({ ...form, cost_per_unit: e.target.value })}
                    required
                    placeholder="0.00"
                />
            </div>

            <button className="submit-btn full-width" onClick={handleSave} disabled={loadingAction} style={{marginTop: '20px'}}>
                {loadingAction ? "Saving..." : (editingId ? "Update Item" : "Add Item")}
            </button>
        </div>
      </Modal>
    </div>
  );
}

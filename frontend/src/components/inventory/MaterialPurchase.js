import React, { useEffect, useState } from 'react';
import TableSkeleton from '../common/TableSkeleton';
import PageHeader from '../common/PageHeader';
import Modal from '../common/Modal'; // Using standard Modal
import {   
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase } from '../../api/purchases';
import { getMaterials } from '../../api/materials';
import { vendorService } from '../../services/vendorService';

import toast from 'react-hot-toast';
import '../../styles/shared/PremiumShared.css'; // Premium Styles

export default function MaterialPurchasesPage() {
  const [loadingAction, setLoadingAction] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  
  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [lastAdded, setLastAdded] = useState(null); // Success feedback
  
  const [form, setForm] = useState({
    material_id: '',
    material_name: '',
    purchase_qty: '',
    purchase_price: '',
    vendor_id: '',
    purchase_date: '',
    measurement_unit: 'pcs',
    min_stock_level: ''
  });

  // Search and pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  // Edit Handler
  function handleEdit(p) {
    setLastAdded(null); 
    setEditingId(p.id);
    let formattedDate = '';
    if (p.purchase_date) {
        const d = new Date(p.purchase_date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        formattedDate = `${year}-${month}-${day}`;
    }

    setForm({
      material_id: p.material_id,
      material_name: p.material_name,
      purchase_qty: p.purchase_qty,
      purchase_price: p.purchase_price,
      vendor_id: p.vendor_id,
      purchase_date: formattedDate || '',
      measurement_unit: p.measurement_unit || 'pcs',
      min_stock_level: p.min_stock_level || ''
    });
    setOpenModal(true);
  }

  // Delete Handler
  async function handleDelete(purchaseId) {
    if(!window.confirm("Are you sure you want to delete this purchase?")) return;
    try {
        setLoadingAction(true);
        await deletePurchase(purchaseId);
        toast.success("Purchase deleted successfully", { duration: 4000 });
        await loadAll(true); // Silent reload
    } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.message || 'Error deleting purchase. Please try again.';
        toast.error(errorMsg);
    } finally {
        setLoadingAction(false);
    }
  }

  // Load Data
  async function loadAll(silent = false) {
    if (!silent) setLoading(true);
    try {
        const mats = await getMaterials();
        setMaterials(mats.data?.items || []);

        const vendorsListResp = await vendorService.getAllVendors();
        setVendors(vendorsListResp.data?.vendors || []);

        const pur = await getPurchases();
        const purchasesList = pur.data?.items || [];
        const purchasesWithVendor = purchasesList.map(p => {
            // Find underlying material if possible to get unit
            const mat = mats.data?.items?.find(m => m.id === p.material_id);
            return {
                ...p,
                vendor_name: p.vendor_name || 'N/A',
                material_name: p.material_name || 'N/A',
                measurement_unit: p.measurement_unit || (mat ? mat.measurement_unit : 'pcs'),
                purchase_date: p.purchase_date ? new Date(p.purchase_date).toLocaleDateString() : 'N/A'
            };
        });

        setPurchases(purchasesWithVendor);
    } catch (err) {
        console.error(err);
        toast.error('Error loading data.');
    } finally {
        if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Save Handler
  async function handleSave() {
    if (!form.material_name || !form.purchase_qty || !form.purchase_price) {
        toast.error("Please fill in all required fields");
        return;
    }

    setLoadingAction(true); 
    try {
        const materialData = { ...form };
        const existingMat = materials.find(m => m.name.toLowerCase() === form.material_name.toLowerCase());
        
        if (existingMat) {
            materialData.material_id = existingMat.id;
        } else {
            materialData.material_id = ''; // Backend will auto-create
        }

    if (editingId) {
            await updatePurchase(editingId, materialData);
            toast.success('Purchase updated');
            setOpenModal(false);
            setEditingId(null);
        } else {
            await createPurchase(materialData);
            toast.success('Purchase recorded. Add another?');
            // Keep modal open, but clear lastAdded if we auto-transition
            setLastAdded(materialData.material_name);
            setEditingId(null);
        }
        
        // Reset form but keep date/vendor if convenient? No, user requested "add as much purchase", usually implies fresh form or maybe sticky fields. 
        // For now, full reset is safer to avoid confusion.
        setForm({
            material_id: '',
            material_name: '',
            purchase_qty: '',
            purchase_price: '',
            vendor_id: form.vendor_id, 
            purchase_date: form.purchase_date,
            measurement_unit: 'pcs',
            min_stock_level: ''
        });

        loadAll();
    } catch (err) {
        console.log(err);
        toast.error(err.response?.data?.message || 'Error saving purchase');
    } finally {
        setLoadingAction(false);
    }
  }

  // Filter & Pagination
  const filteredPurchases = purchases.filter(p =>
    p.material_name.toLowerCase().includes(search.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredPurchases.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div className="page-container">
      {/* Loading Overlay */}
      {loadingAction && (
        <div className="loading-overlay">
            <div className="spinner"></div>
        </div>
      )}

      {/* Header & Actions */}
      <div className="page-header-actions">
          <input
            type="text"
            className="search-bar"
            placeholder="Search by material..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
          />

          <button className="premium-btn primary" onClick={() => {
              setEditingId(null);
              setForm({
                  material_id: '',
                  material_name: '',
                  purchase_qty: '',
                  purchase_price: '',
                  purchase_date: new Date().toISOString().split('T')[0],
                  measurement_unit: 'pcs',
                  min_stock_level: ''
              });
              setOpenModal(true);
          }}>
              + Record Purchase
          </button>
      </div>

      {loading ? (
        <TableSkeleton columns={[{key:'1'},{key:'2'},{key:'3'},{key:'4'},{key:'5'}]} rows={10} />
      ) : (
        <div className="table-container">
          <table className="premium-table">
            <thead>
                <tr>
                    <th>Material</th>
                    <th>Qty</th>
                    <th>Unit Cost</th>
                    <th>Price (NGN)</th>
                    <th>Vendor</th>
                    <th>Date</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
            </thead>
            <tbody>
                {paginated.length === 0 ? (
                    <tr><td colSpan="7" className="empty-state">No purchase records found.</td></tr>
                ) : (
                    paginated.map(p => (
                        <tr key={p.id}>
                            <td style={{fontWeight: '600', color: '#0f172a'}}>{p.material_name}</td>
                            <td>
                                {Number(p.purchase_qty).toFixed(2)} <span style={{fontSize: '12px', color: '#64748b'}}>{p.measurement_unit}</span>
                            </td>
                            <td>₦{Number(p.purchase_price / p.purchase_qty).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                            <td>₦{Number(p.purchase_price).toLocaleString()}</td>
                            <td>
                                {p.vendor_name !== 'N/A' ? (
                                    <span style={{background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontSize: '13px'}}>
                                        {p.vendor_name}
                                    </span>
                                ) : <span style={{color: '#94a3b8'}}>-</span>}
                            </td>
                            <td>{p.purchase_date}</td>
                            <td style={{textAlign: 'right'}}>
                                <button className="item-action-btn edit" onClick={() => handleEdit(p)}>Edit</button>
                                <button className="item-action-btn delete" onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
          </table>

          {/* Pagination */}
          {filteredPurchases.length > ITEMS_PER_PAGE && (
            <div className="pagination-container">
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span style={{fontSize: '14px', color: '#64748b'}}>Page {currentPage} of {totalPages}</span>
              <button 
                className="page-btn" 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        visible={openModal}
        onClose={() => { setOpenModal(false); setLastAdded(null); }}
        title={editingId ? "Edit Purchase Record" : "New Purchase Record"}
      >
        <div className="vendor-form"> {/* Reusing vendor form style for consistency */}
            
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

            {/* Changed from form-grid to vertical layout */}
            <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '20px', 
                maxHeight: '50vh', // Reduced to accommodate success banner
                overflowY: 'auto', 
                paddingRight: '4px' // Prevent scrollbar overlapping content
            }}>
                <div className="form-group full-width">
                    <label style={{color: '#0f172a!important'}} className="premium-label-2">Material Name</label>
                    <input
                        className="premium-input"
                        list="material-list"
                        placeholder="Search existing or type new..."
                        value={form.material_name}
                        onChange={e => {
                            const val = e.target.value;
                            const mat = materials.find(m => m.name.toLowerCase() === val.toLowerCase());
                            setForm({ 
                                ...form, 
                                material_name: val,
                                min_stock_level: mat ? mat.min_stock_level : form.min_stock_level,
                                measurement_unit: mat ? mat.measurement_unit : form.measurement_unit
                            });
                        }}
                        autoFocus
                    />
                    <datalist id="material-list">
                        {materials.map(m => <option key={m.id} value={m.name} />)}
                    </datalist>
                </div>

                <div className="form-group">
                    <label className="premium-label-2">Quantity</label>
                    <input
                        className="premium-input"
                        type="number"
                        placeholder="0.00"
                        value={form.purchase_qty}
                        onChange={e => setForm({ ...form, purchase_qty: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="premium-label-2">Threshold (Par Level)</label>
                    <input
                        className="premium-input"
                        type="number"
                        placeholder="0.00"
                        value={form.min_stock_level}
                        onChange={e => setForm({ ...form, min_stock_level: e.target.value })}
                    />
                    <small style={{display: 'block', fontSize: '11px', color: '#64748b', marginTop: '4px'}}>
                        Min stock balance before alert.
                    </small>
                </div>

                <div className="form-group">
                    <label className="premium-label-2">Price (₦)</label>
                    <input
                        className="premium-input"
                        type="number"
                        placeholder="0.00"
                        value={form.purchase_price}
                        onChange={e => setForm({ ...form, purchase_price: e.target.value })}
                    />
                </div>

                <div className="form-group">
                    <label className="premium-label-2">Measurement Unit</label>
                    <input
                        className="premium-input"
                        list="unit-list"
                        placeholder="pcs, kg, Liters..."
                        value={form.measurement_unit}
                        onChange={e => setForm({ ...form, measurement_unit: e.target.value })}
                    />
                    <datalist id="unit-list">
                        <option value="pcs" />
                        <option value="kg" />
                        <option value="g" />
                        <option value="Liters" />
                        <option value="ml" />
                        <option value="Meters" />
                        <option value="Rolls" />
                        <option value="Pack" />
                        <option value="Carton" />
                    </datalist>
                </div>

                <div className="form-group">
                    <label className="premium-label-2">Date</label>
                    <input
                        className="premium-input"
                        type="date"
                        value={form.purchase_date}
                        onChange={e => setForm({ ...form, purchase_date: e.target.value })}
                    />
                </div>

                <div className="form-group full-width">
                     <label className="premium-label-2">Vendor</label>
                     <select
                        className="premium-input"
                        value={form.vendor_id}
                        onChange={e => setForm({ ...form, vendor_id: e.target.value })}
                     >
                        <option value="">Select Vendor...</option>
                        {vendors.map(v => (
                            <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                     </select>
                </div>
            </div>

            <button className="submit-btn full-width" onClick={handleSave} disabled={loadingAction}>
                {loadingAction ? "Saving..." : (editingId ? "Update Record" : "Record Purchase")}
            </button>
        </div>
      </Modal>
    </div>
  );
}

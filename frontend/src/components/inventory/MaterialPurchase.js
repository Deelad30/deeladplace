import React, { useEffect, useState } from 'react';
import PageHeader from '../common/PageHeader';
import Modals from '../common/Modals';
import Table from '../common/Table';
import {   
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase } from '../../api/purchases';
import { getMaterials } from '../../api/materials';
import { vendorService } from '../../services/vendorService';

import toast from 'react-hot-toast';
import '../../styles/pages/MaterialPurchasesPage.css';

export default function MaterialPurchasesPage() {
  const [loadingAction, setLoadingAction] = useState(false);
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendor, setVendor] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [form, setForm] = useState({
    material_id: '',
    purchase_qty: '',
    purchase_price: '',
    vendor_id: '',
    purchase_date: ''
  });

  //Edit and Delete
  const [editingId, setEditingId] = useState(null);
  function handleEdit(p) {
    setEditingId(p.id);
      let formattedDate = '';
  if (p.purchase_date) {
    const d = new Date(p.purchase_date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // month is 0-based
    const day = String(d.getDate()).padStart(2, '0');
    formattedDate = `${year}-${month}-${day}`;
  }

    setForm({
      material_id: p.material_id,
      purchase_qty: p.purchase_qty,
      purchase_price: p.purchase_price,
      vendor_id: p.vendor_id,
      purchase_date: formattedDate || ''
    });
    setOpenModal(true);
  }

async function handleDelete(purchaseId) {
  try {
    setLoadingAction(true); // show spinner
    await deletePurchase(purchaseId);
    toast.success('Purchase deleted');
    loadAll();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || 'Error deleting purchase');
  } finally {
    setLoadingAction(false); // hide spinner
  }
}




  // Search and pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
async function loadAll() {
  setLoading(true);
  try {
    const mats = await getMaterials();
    const materialsList = mats.data?.items || [];
    setMaterials(materialsList);

    const vendorsListResp = await vendorService.getAllVendors();
    const vendorsList = vendorsListResp.data?.vendors || [];
    setVendors(vendorsList);

    const pur = await getPurchases();
    const purchasesList = pur.data?.items || [];

    // Fetch vendor names for all purchases at once
    const purchasesWithVendor = await Promise.all(
      purchasesList.map(async (p) => {
        let vendorName = 'N/A';
        if (p.vendor_id) {
          try {
            const vendorResp = await vendorService.getVendorById(p.vendor_id);
            console.log(vendorResp);
            
            vendorName = vendorResp.data?.vendor?.name || 'N/A';
          } catch (err) {
            console.error(`Failed to fetch vendor ${p.vendor_id}`, err);
          }
        }

      const purchaseDate = p.purchase_date
      ? new Date(p.purchase_date).toLocaleDateString() // e.g. "12/5/2025"
      : 'N/A';


        const material = materialsList.find(m => m.id === p.material_id);

        return {
          ...p,
          vendor_name: vendorName,
          material_name: material ? material.name : 'N/A',
          purchase_date: purchaseDate
        };
      })
    );

    setPurchases(purchasesWithVendor);
  } catch (err) {
    console.error(err);
    toast.error('Error loading data.');
  }
  setLoading(false);
}
  useEffect(() => {
    loadAll();
  }, []);

async function handleSave() {
   setOpenModal(false);
  try {
    setLoadingAction(true); // show spinner

    if (editingId) {
      await updatePurchase(editingId, form);
      toast.success('Purchase updated');
    } else {
      await createPurchase(form);
      toast.success('Purchase recorded');
    }
    setEditingId(null);
    setForm({
      material_id: '',
      purchase_qty: '',
      purchase_price: '',
      vendor_id: '',
      purchase_date: null,
    });

    loadAll();
  } catch (err) {
    console.log(err);
    toast.error(err.response?.data?.message || 'Error saving purchase');
  } finally {
    setLoadingAction(false); // hide spinner
  }
}



  const columns = [
    { key: 'material_name', label: 'Material' },
    { key: 'purchase_qty', label: 'Qty' },
    { key: 'purchase_price', label: 'Price' },
    { key: 'vendor_name', label: 'Vendor' },
    { key: 'purchase_date', label: 'Date' },
    { key: 'actions', label: 'Actions' },
  ];

  // 🔍 Filter by material name or vendor name
  const filteredPurchases = purchases.filter(p =>
    p.material_name.toLowerCase().includes(search.toLowerCase())
  );
  

  // 📄 Pagination
  const totalPages = Math.ceil(filteredPurchases.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredPurchases.slice(start, start + ITEMS_PER_PAGE);

  const tableData = paginated.map(p => ({
  ...p,
  purchase_qty: p.purchase_qty != null ? Number(p.purchase_qty).toFixed(2) : '0.00',
  purchase_price: p.purchase_price != null ? Number(p.purchase_price).toFixed(2) : '0.00',
    actions: (
    <>
      <button
        onClick={() => handleEdit(p)}
        style={{
          marginRight: 5,
          padding: '5px 10px',
          backgroundColor: '#4caf50',
          color: '#fff',
          border: 'none',
          borderRadius: 3,
          cursor: 'pointer'
        }}
      >
        Edit
      </button>
      <button
        onClick={() => handleDelete(p.id)}
        style={{
          padding: '5px 10px',
          backgroundColor: '#f44336',
          color: '#fff',
          border: 'none',
          borderRadius: 3,
          cursor: 'pointer'
        }}
      >
        Delete
      </button>
    </>
  )
}));

  return (
    <div className="page-container">
      {loadingAction && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}
  >
    <div className="spinner"></div>
  </div>
)}
      <PageHeader
        title="Material Purchases"
        actionLabel="Add Purchase"
        onAction={() => setOpenModal(true)}
      />

      {/* Search Filter */}
      <input
        type="text"
        placeholder="Search by material"
        value={search}
        onChange={e => {
          setSearch(e.target.value);
          setCurrentPage(1);
        }}
        style={{
          width: 250,
          marginBottom: 15,
          padding: 8,
          borderRadius: 5,
          border: '1px solid #ccc'
        }}
      />

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <Table columns={columns} data={tableData} />

          {/* Pagination only if needed */}
          {filteredPurchases.length > ITEMS_PER_PAGE && (
            <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
              {currentPage > 1 && (
                <button
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  Previous
                </button>
              )}

              <span>Page {currentPage} of {totalPages}</span>

              {currentPage < totalPages && (
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer'
                  }}
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal for adding purchase */}
<Modals
  open={openModal}
  title={editingId ? "Edit Purchase" : "New Purchase"}
  onClose={() => {
    setOpenModal(false);
    setEditingId(null);
    setForm({
      material_id: '',
      purchase_qty: '',
      purchase_price: '',
      vendor_id: '',
      purchase_date: null,
    });
  }}
>
  <div className="form-group">
    <label>Material</label>
    <select
      value={form.material_id}
      onChange={e => setForm({ ...form, material_id: e.target.value })}
    >
      <option value="">Select material</option>
      {materials.map(m => (
        <option key={m.id} value={m.id}>{m.name}</option>
      ))}
    </select>
  </div>

  <div className="form-group">
    <label>Quantity</label>
    <input
      type="number"
      value={form.purchase_qty}
      onChange={e => setForm({ ...form, purchase_qty: e.target.value })}
    />
  </div>

  <div className="form-group">
    <label>Total Price</label>
    <input
      type="number"
      value={form.purchase_price}
      onChange={e => setForm({ ...form, purchase_price: e.target.value })}
    />
  </div>

  <div className="form-group">
    <label>Vendor</label>
    <select
      value={form.vendor_id}
      onChange={e => setForm({ ...form, vendor_id: e.target.value })}
    >
      <option value="">Select vendor</option>
      {vendors.map(v => (
        <option key={v.id} value={v.id}>{v.name}</option>
      ))}
    </select>
  </div>

  <div className="form-group">
    <label>Purchase Date</label>
    <input
      type="date"
      value={form.purchase_date || ""}
      onChange={e => setForm({ ...form, purchase_date: e.target.value })}
    />
  </div>

  <button
    className="primary-btn full"
    onClick={handleSave}
    style={{
      marginTop: 10,
      padding: '8px 15px',
      backgroundColor: '#1976d2',
      color: '#fff',
      border: 'none',
      borderRadius: 4,
      cursor: 'pointer'
    }}
  >
    Save
  </button>
</Modals>

    </div>
  );
}

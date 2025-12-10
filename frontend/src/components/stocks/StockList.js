import React, { useEffect, useState } from 'react';
import PageHeader from '../common/PageHeader';
import Modals from '../common/Modals';
import Table from '../common/Table';
import { toast } from 'react-hot-toast';
import {
  getStockItems,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  adjustStockQuantity
} from '../../api/stockList';
import '../../styles/pages/StockItemsPage.css';

export default function StockItemsPage() {
  const [loading, setLoading] = useState(true);
  const [stockItems, setStockItems] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', measurement_unit: '', stock_quantity: 0, alarm_threshold: 5 });
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  async function loadStockItems() {
    setLoading(true);
    try {
      const res = await getStockItems();
      setStockItems(res.data.stockItems);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load stock items.');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadStockItems();
  }, []);

  async function handleSave() {
    if (!form.name.trim() || !form.measurement_unit.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      if (editingId) {
        await updateStockItem(editingId, form);
        toast.success('Stock item updated.');
        setEditingId(null);
      } else {
        await createStockItem(form);
        toast.success('Stock item added.');
      }
      setForm({ name: '', measurement_unit: '', stock_quantity: 0, alarm_threshold: 5 });
      setOpenModal(false);
      loadStockItems();
    } catch (err) {
      toast.error('Error saving stock item.');
    }
  }

  function handleEdit(item) {
  // fire toast immediately before any state update batching
  setTimeout(() => {
    toast.success(`Editing "${item.name}"`);
  }, 0);

  setEditingId(item.id);
  setForm({
    name: item.name,
    measurement_unit: item.measurement_unit,
    stock_quantity: item.stock_quantity,
    alarm_threshold: item.alarm_threshold || 5
  });

  setOpenModal(true);
}

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this stock item?")) return;
    try {
      await deleteStockItem(id);
      toast.success('Stock item deleted.');
      loadStockItems();
    } catch (err) {
      toast.error('Failed to delete stock item.');
    }
  }

  async function handleAdjust(id, adjustment) {
    try {
      await adjustStockQuantity(id, adjustment);
      loadStockItems();
    } catch (err) {
      toast.error(`${err.response.data.message}, please refill.`);
      console.log(err)
    }
  }

  const filteredStock = stockItems.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.measurement_unit.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStock.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredStock.slice(start, start + ITEMS_PER_PAGE);

const tableData = paginated.map(item => {
  const qty = Number(item.stock_quantity);
  const threshold = Number(item.alarm_threshold);
  const isLowStock = qty <= threshold;
  const stockPercent = Math.min((qty / Math.max(threshold, 1)) * 100, 100);

  return {
    ...item,

    stock_quantity: (
      <div className="stock-flex">
        {/* -1 button */}
        <button
          className="btn btn-remove small"
          onClick={() => handleAdjust(item.id, -1)}
        >
          -1
        </button>

        {/* Stock bar */}
        <div className="stock-bar-container slim">
          <div
            className={`stock-bar ${isLowStock ? "stock-low" : "stock-ok"}`}
            style={{ width: `${stockPercent}%` }}
          ></div>
          <span className="stock-text">
            {qty} {item.measurement_unit}
          </span>
        </div>

        {/* +1 button */}
        <button
          className="btn btn-add small"
          onClick={() => handleAdjust(item.id, 1)}
        >
          +1
        </button>
      </div>
    ),

    // keep edit/delete on the far right
    actions: (
<div style={{ display: "flex", gap: "8px" }}>
  <button className="btn btn-edit" onClick={() => handleEdit(item)}>
    Edit
  </button>
  <button className="btn btn-delete" onClick={() => handleDelete(item.id)}>
    Delete
  </button>
</div>
    )
  };
});



  return (
    <div className="page-container">
      <PageHeader
        title="Stock Items"
        actionLabel="Add Item"
        onAction={() => {
          setOpenModal(true);
          setEditingId(null);
          setForm({ name: '', measurement_unit: '', stock_quantity: 0, alarm_threshold: 5 });
        }}
      />

      <input
        className="search-input"
        type="text"
        placeholder="Search stock items..."
        value={search}
        onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
      />

      {loading ? (
        <div className="loading">Loading...</div>
      ) : (
        <>
          <Table columns={[
            { key: 'name', label: 'Name' },
            { key: 'measurement_unit', label: 'Unit' },
            { key: 'stock_quantity', label: 'Stock' },
            { key: 'actions', label: 'Actions' }
          ]} data={tableData} />

          {filteredStock.length > ITEMS_PER_PAGE && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      <Modals open={openModal} title={editingId ? 'Edit Stock Item' : 'New Stock Item'} onClose={() => setOpenModal(false)}>
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Measurement Unit</label>
          <input value={form.measurement_unit} onChange={e => setForm({ ...form, measurement_unit: e.target.value })} />
        </div>

        <div className="form-group">
          <label>Stock Quantity</label>
          <input type="number" value={form.stock_quantity} onChange={e => setForm({ ...form, stock_quantity: Number(e.target.value) })} />
        </div>

        <div className="form-group">
          <label>Alarm Threshold</label>
          <input type="number" value={form.alarm_threshold} onChange={e => setForm({ ...form, alarm_threshold: Number(e.target.value) })} />
        </div>

        <button className="primary-btn" onClick={handleSave}>{editingId ? 'Update' : 'Save'}</button>
      </Modals>
    </div>
  );
}

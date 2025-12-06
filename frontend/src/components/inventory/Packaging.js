import React, { useEffect, useState } from 'react';
import PageHeader from '../common/PageHeader';
import Modals from '../common/Modals';
import Table from '../common/Table';
import {
  getPackaging,
  createPackaging,
  updatePackaging,
  deletePackaging
} from '../../api/packaging.services';
import toast from 'react-hot-toast';

export default function PackagingPage() {
  const [loading, setLoading] = useState(true);
  const [packaging, setPackaging] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', cost_per_unit: '' });

  // Search + Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  async function loadPackaging() {
    setLoading(true);
    try {
      const res = await getPackaging();
      setPackaging(res.data.packaging);
    } catch (err) {
      toast.error('Failed to load packaging.');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadPackaging();
  }, []);

  async function handleSave() {
    if (!form.name.trim() || !form.cost_per_unit.trim()) {
      toast.error('Please fill all fields.');
      return;
    }

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

    try {
      await deletePackaging(id);
      toast.success('Packaging deleted.');
      loadPackaging();
    } catch (err) {
      toast.error('Failed to delete packaging.');
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'cost_per_unit', label: 'Cost/Unit' },
    { key: 'actions', label: 'Actions' }
  ];

  // Search filter
  const filtered = packaging.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

  const tableData = paginated.map(pkg => ({
    ...pkg,
    cost_per_unit: Number(pkg.cost_per_unit).toFixed(2),
    actions: (
      <>
        <button
          onClick={() => handleEdit(pkg)}
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
          onClick={() => handleDelete(pkg.id)}
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
      <PageHeader
        title="Packaging Items"
        actionLabel="Add Packaging"
        onAction={() => {
          setOpenModal(true);
          setEditingId(null);
          setForm({ name: '', cost_per_unit: '' });
        }}
      />

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search packaging..."
        value={search}
        onChange={(e) => {
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

          {/* Pagination */}
          {filtered.length > ITEMS_PER_PAGE && (
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

      {/* Modal */}
      <Modals
        open={openModal}
        title={editingId ? 'Edit Packaging' : 'New Packaging'}
        onClose={() => setOpenModal(false)}
      >
        <div className="form-group">
          <label>Name</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>Cost Per Unit</label>
          <input
            type="number"
            value={form.cost_per_unit}
            onChange={e => setForm({ ...form, cost_per_unit: e.target.value })}
            required
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
          {editingId ? 'Update' : 'Save'}
        </button>
      </Modals>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import PageHeader from '../common/PageHeader';
import Modals from '../common/Modals';
import Table from '../common/Table';
import { getMaterials, createMaterial, updateMaterial, deleteMaterial } from '../../api/materials';
import toast from 'react-hot-toast';
import '../../styles/pages/RawMaterialsPage.css'

export default function RawMaterialsPage() {
  const [loading, setLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', measurement_unit: '' });

  // Search and pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  async function loadMaterials() {
    setLoading(true);
    try {
      const res = await getMaterials();
      setMaterials(res.data.items);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load materials.');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadMaterials();
  }, []);

  async function handleSave() {
    if (!form.name.trim() || !form.measurement_unit.trim()) {
      toast.error('Please fill in all fields.');
      return;
    }

    try {
      if (editingId) {
        await updateMaterial(editingId, form);
        toast.success('Material updated.');
        setEditingId(null);
      } else {
        await createMaterial(form);
        toast.success('Material added.');
      }
      setForm({ name: '', measurement_unit: '' });
      setOpenModal(false);
      loadMaterials();
    } catch (err) {
      toast.error('Error saving material.');
    }
  }

  function handleEdit(material) {
    setEditingId(material.id);
    setForm({
      name: material.name,
      measurement_unit: material.measurement_unit
    });
    setOpenModal(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      await deleteMaterial(id);
      toast.success('Material deleted.');
      loadMaterials();
    } catch (err) {
      toast.error('Failed to delete material.');
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'measurement_unit', label: 'Unit' },
    { key: 'stock_balance', label: 'Stock' },
    { key: 'avg_cost', label: 'Avg Cost' },
    { key: 'actions', label: 'Actions' }
  ];

  // Filter materials by search
  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.measurement_unit.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredMaterials.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filteredMaterials.slice(start, start + ITEMS_PER_PAGE);

const tableData = paginated.map(mat => ({
  ...mat,
  stock_balance: mat.stock_balance != null ? Number(mat.stock_balance).toFixed(2) : '0.00',
  avg_cost: mat.avg_cost != null ? Number(mat.avg_cost).toFixed(2) : '0.00',
  actions: (
    <>
      <button
        onClick={() => handleEdit(mat)}
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
        onClick={() => handleDelete(mat.id)}
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
        title="Raw Materials"
        actionLabel="Add Material"
        onAction={() => {
          setOpenModal(true);
          setEditingId(null);
          setForm({ name: '', measurement_unit: '' });
        }}
      />

      {/* Search filter */}
      <input
        type="text"
        placeholder="Search materials..."
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
          <Table columns={columns} data={tableData}
          onEdit={handleEdit} onDelete={handleDelete}
          />

          {/* Pagination only if more than ITEMS_PER_PAGE */}
          {filteredMaterials.length > ITEMS_PER_PAGE && (
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

      <Modals
        open={openModal}
        title={editingId ? 'Edit Material' : 'New Material'}
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
          <label>Measurement Unit</label>
          <input
            value={form.measurement_unit}
            onChange={e => setForm({ ...form, measurement_unit: e.target.value })}
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

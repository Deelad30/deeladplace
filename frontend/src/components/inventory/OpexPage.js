import React, { useEffect, useState } from 'react';
import PageHeader from '../common/PageHeader';
import Modals from '../common/Modals';
import Table from '../common/Table';
import toast from 'react-hot-toast';

import { getOpex, createOpex, updateOpex, deleteOpex } from '../../api/opex';
import '../../styles/pages/RawMaterialsPage.css';

export default function OpexPage() {
  const [loading, setLoading] = useState(true);
  const [opexList, setOpexList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: '',
    allocation_mode: 'fixed',
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
    }
    setLoading(false);
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
      } else {
        await createOpex(payload);
        toast.success("OPEX added successfully");
      }

      setForm({
        name: '',
        allocation_mode: 'fixed',
        amount: '',
        percentage_value: '',
        effective_from: '',
        effective_to: ''
      });
      setOpenModal(false);
      loadOpex();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save OPEX item");
    }
  };

  // Edit OPEX
  function handleEdit(record) {
    setEditingId(record.id);
    setForm({
      name: record.name,
      allocation_mode: record.allocation_mode,
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
    try {
      await deleteOpex(id);
      toast.success('OPEX record deleted.');
      loadOpex();
    } catch (err) {
      toast.error('Failed to delete OPEX record.');
    }
  }

  // Table columns
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'allocation_mode', label: 'Mode' },
    { key: 'amount', label: 'Amount' },
    { key: 'percentage_value', label: '% of COGS' },
    { key: 'effective_from', label: 'Start Date' },
    { key: 'effective_to', label: 'End Date' },
    { key: 'actions', label: 'Actions' }
  ];

  // Filter and paginate
  const filtered = opexList.filter(o =>
    o.name.toLowerCase().includes(search.toLowerCase()) ||
    (o.amount && String(o.amount).includes(search))
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

  const tableData = paginated.map(o => ({
    ...o,
    effective_from: formatDateDisplay(o.effective_from),
    effective_to: formatDateDisplay(o.effective_to),
    actions: (
      <>
        <button
          onClick={() => handleEdit(o)}
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
          onClick={() => handleDelete(o.id)}
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
        title="OPEX"
        actionLabel="Add OPEX"
        onAction={() => {
          setOpenModal(true);
          setEditingId(null);
          setForm({
            name: '',
            allocation_mode: 'fixed',
            amount: '',
            percentage_value: '',
            effective_from: '',
            effective_to: ''
          });
        }}
      />

      <input
        type="text"
        placeholder="Search OPEX..."
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
          {filtered.length > ITEMS_PER_PAGE && (
            <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
              {currentPage > 1 && (
                <button onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
              )}
              <span>Page {currentPage} of {totalPages}</span>
              {currentPage < totalPages && (
                <button onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modals
        open={openModal}
        title={editingId ? 'Edit OPEX' : 'New OPEX'}
        onClose={() => setOpenModal(false)}
      >
        <div className="form-group">
          <label>Name</label>
          <input
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Allocation Mode</label>
          <select
            value={form.allocation_mode}
            onChange={e => setForm({ ...form, allocation_mode: e.target.value })}
          >
            <option value="fixed">Fixed</option>
            <option value="percent_of_cogs">% of COGS</option>
          </select>
        </div>

        {form.allocation_mode === 'fixed' && (
          <div className="form-group">
            <label>Amount</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
            />
          </div>
        )}

        {form.allocation_mode === 'percent_of_cogs' && (
          <div className="form-group">
            <label>Percentage Value</label>
            <input
              type="number"
              value={form.percentage_value}
              onChange={e => setForm({ ...form, percentage_value: e.target.value })}
            />
          </div>
        )}

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={form.effective_from}
            onChange={e => setForm({ ...form, effective_from: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={form.effective_to}
            onChange={e => setForm({ ...form, effective_to: e.target.value })}
          />
        </div>

        <button className="primary-btn full" onClick={handleSave}>
          {editingId ? 'Update' : 'Save'}
        </button>
      </Modals>
    </div>
  );
}

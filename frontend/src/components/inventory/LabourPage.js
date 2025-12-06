import React, { useEffect, useState } from 'react';
import PageHeader from '../common/PageHeader';
import Modals from '../common/Modals';
import Table from '../common/Table';
import toast from 'react-hot-toast';

import { getLabour, createLabour, updateLabour, deleteLabour } from '../../api/labour';
import '../../styles/pages/RawMaterialsPage.css';

export default function LabourPage() {
  const [loading, setLoading] = useState(true);
  const [labourList, setLabourList] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    amount: '',
    allocation_type: 'fixed',
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
    }
    setLoading(false);
  }

  useEffect(() => {
    loadLabour();
  }, []);

  async function handleSave() {
    if (!form.name.trim() || !form.amount || !form.allocation_type.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      if (editingId) {
        await updateLabour(editingId, form);
        toast.success('Labour record updated.');
        setEditingId(null);
      } else {
        await createLabour(form);
        toast.success('Labour record added.');
      }
      setForm({ name: '', amount: '', allocation_type: 'fixed', start_date: '', end_date: '' });
      setOpenModal(false);
      loadLabour();
    } catch (err) {
      toast.error('Error saving labour record.');
    }
  }

  function handleEdit(record) {
    setEditingId(record.id);
    setForm({
      name: record.name,
      amount: record.amount,
      allocation_type: record.allocation_type,
      start_date: formatDateForInputLocal(record.start_date),
      end_date: formatDateForInputLocal(record.end_date)
    });
    setOpenModal(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteLabour(id);
      toast.success('Labour record deleted.');
      loadLabour();
    } catch (err) {
      toast.error('Failed to delete labour record.');
    }
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'amount', label: 'Amount' },
    { key: 'allocation_type', label: 'Type' },
    { key: 'start_date', label: 'Start Date' },
    { key: 'end_date', label: 'End Date' },
    { key: 'actions', label: 'Actions' }
  ];

  const filtered = labourList.filter(l =>
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    String(l.amount).includes(search)
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = filtered.slice(start, start + ITEMS_PER_PAGE);

  const tableData = paginated.map(l => ({
    ...l,
    start_date: formatDateDisplay(l.start_date),
    end_date: formatDateDisplay(l.end_date),
    actions: (
      <>
        <button
          onClick={() => handleEdit(l)}
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
          onClick={() => handleDelete(l.id)}
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
        title="Labour"
        actionLabel="Add Labour"
        onAction={() => {
          setOpenModal(true);
          setEditingId(null);
          setForm({ name: '', amount: '', allocation_type: 'fixed', start_date: '', end_date: '' });
        }}
      />

      <input
        type="text"
        placeholder="Search labour..."
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

      <Modals
        open={openModal}
        title={editingId ? 'Edit Labour' : 'New Labour'}
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
          <label>Amount</label>
          <input
            type="number"
            value={form.amount}
            onChange={e => setForm({ ...form, amount: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>Allocation Type</label>
          <select
            value={form.allocation_type}
            onChange={e => setForm({ ...form, allocation_type: e.target.value })}
          >
            <option value="fixed">Fixed</option>
          </select>
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={form.start_date}
            onChange={e => setForm({ ...form, start_date: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={form.end_date}
            onChange={e => setForm({ ...form, end_date: e.target.value })}
          />
        </div>

        <button className="primary-btn full" onClick={handleSave}>
          {editingId ? 'Update' : 'Save'}
        </button>
      </Modals>
    </div>
  );
}

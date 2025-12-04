import React, { useState, useEffect, useCallback } from 'react';
import { vendorService } from '../../services/vendorService';
import Modal from '../common/Modal';
import Toast from '../common/Toast';
import './VendorsList.css';

const ITEMS_PER_PAGE = 20;

const VendorList = () => {
  // Vendor data states
  const [vendorToDelete, setVendorToDelete] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Dashboard counters
  const [totalVendors, setTotalVendors] = useState(0);
  const [activeVendors, setActiveVendors] = useState(0);
  const [inactiveVendors, setInactiveVendors] = useState(0);

  // Modal & Toast
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null); 
  const [creating, setCreating] = useState(false);
  const [newVendor, setNewVendor] = useState({ name: '', description: '', is_active: true });
  const [toast, setToast] = useState(null);

  // Fetch vendors
const fetchVendors = useCallback(async () => {
  try {
    setLoading(true);
    const response = await vendorService.getAllVendors();
    if (response.data.success) {
      const sortedVendors = response.data.vendors.sort((a, b) => a.id - b.id);
      setVendors(sortedVendors);
      setFilteredVendors(sortedVendors);
      animateCounters(sortedVendors);
    } else {
      setError('Failed to fetch vendors');
    }
  } catch (err) {
    console.error(err);
    setError('Error fetching vendors');
  } finally {
    setLoading(false);
  }
}, []); // include any state setters if needed


  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  // Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Animate dashboard counters
  const animateCounters = (vendorsList) => {
    const total = vendorsList.length;
    const active = vendorsList.filter(v => v.is_active).length;
    const inactive = vendorsList.filter(v => !v.is_active).length;

    let t = 0, a = 0, i = 0;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const totalStep = total / steps;
    const activeStep = active / steps;
    const inactiveStep = inactive / steps;

    const interval = setInterval(() => {
      t += totalStep;
      a += activeStep;
      i += inactiveStep;
      setTotalVendors(Math.round(t));
      setActiveVendors(Math.round(a));
      setInactiveVendors(Math.round(i));
      if (t >= total) {
        setTotalVendors(total);
        setActiveVendors(active);
        setInactiveVendors(inactive);
        clearInterval(interval);
      }
    }, stepTime);
  };

  // Search vendors
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setCurrentPage(1);
    setFilteredVendors(
      vendors.filter(
        v =>
          v.name.toLowerCase().includes(term) ||
          (v.description && v.description.toLowerCase().includes(term))
      )
    );
  };

  // Edit vendor
  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setNewVendor({
      name: vendor.name,
      description: vendor.description || '',
      is_active: vendor.is_active,
    });
    setModalVisible(true);
  };

// Delete vendor
const handleDelete = (vendor) => {
  setVendorToDelete(vendor);
  setDeleteModalVisible(true);
};

//Delete Vendor 
const confirmDeleteVendor = async () => {
  try {
    setCreating(true); // show spinner using same state

    await vendorService.delete(vendorToDelete.id);

    setToast({ message: "Vendor deleted successfully", type: "success" });

    setDeleteModalVisible(false);
    setVendorToDelete(null);
    fetchVendors();

  } catch (error) {
    console.error(error);
    setToast({ message: "Error deleting vendor", type: "error" });
  } finally {
    setCreating(false);
  }
};

  // Create vendor
  const handleCreateVendor = async () => {
    if (!newVendor.name.trim()) {
      setToast({ message: 'Name is required', type: 'error' });
      return;
    }

    try {
      setCreating(true);
      const response = await vendorService.create(newVendor);
      if (response) {
        setToast({ message: 'Vendor created successfully', type: 'success' });
        setModalVisible(false);
        setNewVendor({ name: '', description: '', is_active: true });
        fetchVendors();
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error creating vendor', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  // Update vendor
  const handleUpdateVendor = async () => {
    if (!newVendor.name.trim()) {
      setToast({ message: 'Name is required', type: 'error' });
      return;
    }

    try {
      setCreating(true);
      const response = await vendorService.update(editingVendor.id, newVendor);
      if (response) {
        setToast({ message: 'Vendor updated successfully', type: 'success' });
        setModalVisible(false);
        setEditingVendor(null);
        setNewVendor({ name: '', description: '', is_active: true });
        fetchVendors();
      }
    } catch (err) {
      console.error(err);
      setToast({ message: 'Error updating vendor', type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  // Pagination
  const pageCount = Math.ceil(filteredVendors.length / ITEMS_PER_PAGE);
  const paginatedVendors = filteredVendors.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const goPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goNextPage = () => setCurrentPage(prev => Math.min(prev + 1, pageCount));

  if (loading) return <p>Loading vendors...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="vendors-dashboard">
      {/* Header */}
      <div className="vendor-top-container">
        <h2 className='vendor-top'>Vendors Dashboard</h2>
        <button className="create-btn" onClick={() => {
          setEditingVendor(null);
          setNewVendor({ name: '', description: '', is_active: true });
          setModalVisible(true);
        }}>Create Vendor</button>
      </div>

      {/* Dashboard tiles */}
      <div className="dashboard-tiles">
        <div className="tile total">
          <div className="number">{totalVendors}</div>
          <div className="label"><strong>Total Vendors</strong></div>
        </div>
        <div className="tile active">
          <div className="number">{activeVendors}</div>
          <div className="label"><strong>Active Vendors</strong></div>
        </div>
        <div className="tile inactive">
          <div className="number">{inactiveVendors}</div>
          <div className="label"><strong>Inactive Vendors</strong></div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* Vendors table */}
      <table className="vendor-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
{paginatedVendors.map((vendor, index) => (
  <tr key={vendor.id}>
    <td style={{ fontWeight: "500" }}>
      {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
    </td>
    <td style={{ fontWeight: "600" }}>{vendor.name}</td>
    <td style={{ fontWeight: "500" }}>{vendor.description}</td>
    <td className="active-cell">
      {vendor.is_active ? <span className="active-dot"></span> : ''}
    </td>
    <td>
      <button className="edit-btn" onClick={() => handleEdit(vendor)}>Edit</button>
      <button className="delete-btn" onClick={() => handleDelete(vendor)}>Delete</button>
    </td>
  </tr>
))}
        </tbody>
      </table>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="pagination">
          <button onClick={goPrevPage} disabled={currentPage === 1}>Previous</button>
          <span>Page {currentPage} of {pageCount}</span>
          <button onClick={goNextPage} disabled={currentPage === pageCount}>Next</button>
        </div>
      )}

      {/* Modal for Create / Edit */}
      <Modal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingVendor(null);
          setNewVendor({ name: '', description: '', is_active: true });
        }}
        title={editingVendor ? 'Edit Vendor' : 'Create Vendor'}
      >
        <div className="modal-body">
          <div className="checkbox-wrapper">
            <label className="custom-checkbox">
              <input
                type="checkbox"
                checked={newVendor.is_active}
                onChange={e => setNewVendor({ ...newVendor, is_active: e.target.checked })}
              />
              <span className="checkmark"></span>
            </label>
          </div>

          <input
            type="text"
            placeholder="Vendor Name"
            value={newVendor.name}
            onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
          />

          <input
            type="text"
            placeholder="Description"
            value={newVendor.description}
            onChange={e =>
              setNewVendor({ ...newVendor, description: e.target.value.slice(0, 50) })
            }
          />
          <p>{50 - newVendor.description.length} characters remaining</p>

          <button
            className="submit-btn"
            onClick={editingVendor ? handleUpdateVendor : handleCreateVendor}
            disabled={creating}
          >
            {creating ? (editingVendor ? 'Updating...' : 'Creating...') : (editingVendor ? 'Update' : 'Create')}
          </button>
        </div>
      </Modal>

      <Modal
  visible={deleteModalVisible}
  onClose={() => setDeleteModalVisible(false)}
  title="Confirm Delete"
>
  <div className="modal-body">
    <p>Are you sure you want to delete <strong>{vendorToDelete?.name}</strong>?</p>

    <div className="delete-actions">
      <button
        className="submit-btn"
        onClick={confirmDeleteVendor}
        disabled={creating}
      >
        {creating ? "Deleting..." : "Yes, Delete"}
      </button>

      <button
        className="cancel-btn"
        onClick={() => setDeleteModalVisible(false)}
        disabled={creating}
      >
        Cancel
      </button>
    </div>
  </div>
</Modal>


      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};

export default VendorList;

import React, { useState, useEffect, useCallback } from 'react';
import { vendorService } from '../../services/vendorService';
import Modal from '../common/Modal';
import Toast from '../common/Toast';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faCheckCircle, faPauseCircle } from "@fortawesome/free-solid-svg-icons";
import './VendorsList.css';

const ITEMS_PER_PAGE = 20;

const VendorList = () => {
  const user = JSON.parse(localStorage.getItem('user')) || { plan: '' };
  
  // Limit vendor creation based on plan
  const maxVendorsAllowed = (plan, currentCount) => {
    if (plan === 'pro') return currentCount >= 1;
    if (plan === 'enterprise') return currentCount >= 5;
    if (plan === 'demo') return currentCount >= 5000;
    return false; // no limit for other plans
  };

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
  }, []);

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

  // Confirm Delete Vendor 
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
      const errorMessage = error.response?.data?.message || "Error deleting vendor";
      setToast({ message: errorMessage, type: "error" });
    } finally {
      setCreating(false);
    }
  };

  // Create vendor
  const handleCreateVendor = async () => {
    if (maxVendorsAllowed(user.plan, vendors.length)) {
        setToast({ 
        message: user.plan === 'pro' 
          ? 'Pro plan allows only 1 vendor' 
          : 'Enterprise plan allows up to 5 vendors', 
        type: 'error' 
      });
      return;
    }

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

  if (error) return <p>{error}</p>;

  return (
    <div className="vendor-container modern">
      {/* Header */}
      <div className="vendor-header">
        <div>
            <h2>Vendors Dashboard</h2>
            <p className="vendor-sub">Manage suppliers, track performance, and key contacts.</p>
        </div>
        {!maxVendorsAllowed(user.plan, vendors.length) && (
          <button className="create-vendor-btn" onClick={() => {
            setEditingVendor(null);
            setNewVendor({ name: '', description: '', is_active: true });
            setModalVisible(true);
          }}>
             + Add Vendor
          </button>
        )}
      </div>

      {/* Dashboard Tiles */}
      <div className="dashboard-grid">
        <div className="stat-card total">
          <div className="stat-icon">
            <FontAwesomeIcon icon={faBoxOpen} />
          </div>
          <div>
            <div className="stat-value">{totalVendors}</div>
            <div className="stat-label">Total Vendors</div>
          </div>
        </div>
        <div className="stat-card active">
          <div className="stat-icon">
             <FontAwesomeIcon icon={faCheckCircle} />
          </div>
          <div>
             <div className="stat-value">{activeVendors}</div>
             <div className="stat-label">Active Vendors</div>
          </div>
        </div>
        <div className="stat-card inactive">
           <div className="stat-icon">
             <FontAwesomeIcon icon={faPauseCircle} />
           </div>
           <div>
             <div className="stat-value">{inactiveVendors}</div>
             <div className="stat-label">Inactive Vendors</div>
           </div>
        </div>
      </div>

       <div className="vendor-table-wrapper">
          {/* Search & Filter Bar */}
          <div className="controls-bar">
            <div className="search-wrapper">
                <input
                type="text"
                className="search-input"
                placeholder="Search vendors by name or description..."
                value={searchTerm}
                onChange={handleSearch}
                />
            </div>
          </div>

          {/* Vendors table */}
          <div className="table-container">
            <table className="vendor-table">
                <thead>
                <tr>
                    <th>#</th>
                    <th>Vendor Name</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
                </thead>
                <tbody>
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                        <td><div className="skeleton-box" style={{height: '20px', width: '30px'}}></div></td>
                        <td><div className="skeleton-box" style={{height: '20px', width: '150px'}}></div></td>
                        <td><div className="skeleton-box" style={{height: '20px', width: '200px'}}></div></td>
                        <td><div className="skeleton-box" style={{height: '20px', width: '60px'}}></div></td>
                        <td><div className="skeleton-box" style={{height: '30px', width: '100px'}}></div></td>
                    </tr>
                    ))
                ) : paginatedVendors.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="empty-state">No vendors found matching your search.</td>
                    </tr>
                ) : (
                    paginatedVendors.map((vendor, index) => (
                    <tr key={vendor.id}>
                        <td className="id-cell">
                        {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                        </td>
                        <td className="name-cell">{vendor.name}</td>
                        <td className="desc-cell">{vendor.description || <span className="text-muted">-</span>}</td>
                        <td>
                            <span className={`status-pill ${vendor.is_active ? 'active' : 'inactive'}`}>
                                {vendor.is_active ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                        </td>
                        <td className="actions-cell">
                        <button className="table-btn secondary" onClick={() => handleEdit(vendor)}>Edit</button>
                        <button className="table-btn danger" onClick={() => handleDelete(vendor)}>Delete</button>
                        </td>
                    </tr>
                    ))
                )}
                </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pageCount > 1 && (
            <div className="pagination">
              <button className="page-btn" onClick={goPrevPage} disabled={currentPage === 1}>Previous</button>
              <span className="page-info">Page {currentPage} of {pageCount}</span>
              <button className="page-btn" onClick={goNextPage} disabled={currentPage === pageCount}>Next</button>
            </div>
          )}
      </div>

      {/* Modal for Create / Edit */}
      <Modal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setEditingVendor(null);
          setNewVendor({ name: '', description: '', is_active: true });
        }}
        title={editingVendor ? 'Edit Vendor' : 'New Vendor'}
      >
        <div className="vendor-form">
          <div className="form-group">
              <label>Vendor Name</label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Coca Cola Bottling Co."
                value={newVendor.name}
                onChange={e => setNewVendor({ ...newVendor, name: e.target.value })}
              />
          </div>

          <div className="form-group">
             <label>Description ({50 - newVendor.description.length} chars left)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Brief description..."
                value={newVendor.description}
                onChange={e =>
                setNewVendor({ ...newVendor, description: e.target.value.slice(0, 50) })
                }
            />
          </div>

           <div className="form-group checkbox-group">
            <label className="switch-label">
              <input
                type="checkbox"
                checked={newVendor.is_active}
                onChange={e => setNewVendor({ ...newVendor, is_active: e.target.checked })}
              />
              <span className="checkbox-text">Active Status</span>
            </label>
          </div>

          <button
            className="submit-btn full-width"
            onClick={editingVendor ? handleUpdateVendor : handleCreateVendor}
            disabled={creating}
          >
            {creating ? (editingVendor ? 'Updating...' : 'Creating...') : (editingVendor ? 'Save Changes' : 'Create Vendor')}
          </button>
        </div>
      </Modal>


      <Modal
        visible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
        title="Delete Vendor"
        >
        <div className="modal-body">
            <p className="confirm-text">Are you sure you want to delete <strong>{vendorToDelete?.name}</strong>? This action cannot be undone.</p>

            <div className="delete-actions">
            <button
                className="submit-btn danger full-width"
                onClick={confirmDeleteVendor}
                disabled={creating}
            >
                {creating ? "Deleting..." : "Yes, Delete Vendor"}
            </button>

            <button
                className="cancel-btn full-width"
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

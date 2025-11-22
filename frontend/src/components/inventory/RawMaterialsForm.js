import React, { useEffect, useState } from 'react';
import { rawMaterialsService } from '../../services/rawMaterialsService';
import '../../styles/pages/RawMaterialsForm.css';
import { toast } from "react-hot-toast";
import ConfirmationModal from '../common/ConfirmationModal';

const RawMaterialsForm = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({ name: '', unit: '', current_cost: '' });
  const [editingId, setEditingId] = useState(null);

  // Load materials on mount
  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const data = await rawMaterialsService.getAll();
    setMaterials(data);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await rawMaterialsService.update(editingId, formData);
          toast.success('Raw material updated successfully!');
        setEditingId(null);
      } else {
        await rawMaterialsService.create(formData);
          toast.success('Raw material added successfully!');
      }
      setFormData({ name: '', unit: '', current_cost: '' });
      fetchMaterials();
    } catch (err) {
      toast.error('Failed to save raw material.');
      console.error(err);
    }
  };

  const handleEdit = (material) => {
    setEditingId(material.id);
    setFormData({
      name: material.name,
      unit: material.unit,
      current_cost: material.current_cost,
    });
  };

  const confirmDelete = (id) => {
  setDeleteId(id);
  setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
  try {
    await rawMaterialsService.delete(deleteId);
    toast.success('Raw material deleted!');
    fetchMaterials();
  } catch (err) {
    console.error(err);
    toast.error('Failed to delete material.');
  } finally {
    setModalOpen(false);
    setDeleteId(null);
  }
};


  return (
    <><ConfirmationModal
      isOpen={modalOpen}
      onConfirm={handleDeleteConfirm}
      onCancel={() => setModalOpen(false)}
      message="Are you sure you want to delete this material?" /><div className="raw-materials-container">
        <h2>{editingId ? 'Edit Raw Material' : 'Add Raw Material'}</h2>
        <form className="raw-materials-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Material Name"
            value={formData.name}
            onChange={handleChange}
            required />
          <input
            type="text"
            name="unit"
            placeholder="Unit (kg, m, liters)"
            value={formData.unit}
            onChange={handleChange}
            required />
          <input
            type="number"
            name="current_cost"
            placeholder="Cost per unit"
            value={formData.current_cost}
            onChange={handleChange}
            required />
          <button type="submit">{editingId ? 'Update' : 'Add'}</button>
        </form>

        <h3>Raw Materials List</h3>
        <table className="raw-materials-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Unit</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map((mat) => (
              <tr key={mat.id}>
                <td>{mat.name}</td>
                <td>{mat.unit}</td>
                <td>{mat.current_cost}</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(mat)}>Edit</button>
                  <button className="delete-btn" onClick={() => confirmDelete(mat.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></>
    
  );
};

export default RawMaterialsForm;

import React, { useEffect, useState } from 'react';
import { rawMaterialsService } from '../../services/rawMaterialsService';
import { inventoryService } from '../../services/inventoryService';
import toast from 'react-hot-toast';
import '../../styles/pages/SICSForm.css';

const MaterialPurchase = () => {
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    const data = await rawMaterialsService.getAll();
    setMaterials(data);
    setFormData(data.map(mat => ({
      raw_material_id: mat.id,
      name: mat.name,
      unit: mat.unit,
      opening: 0,
      issues: 0,
      waste: 0,
      closing: 0,
      movement_date: new Date().toISOString().split('T')[0], // today
    })));
  };

  const handleChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = Number(value);
    setFormData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      for (const row of formData) {
        await inventoryService.createMovement(row);
      }
      toast.success('Daily inventory submitted successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit daily inventory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sics-form-container">
      <h2>Daily Stock Input (SICS Form)</h2>
      <form className="sics-form" onSubmit={handleSubmit}>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Unit</th>
              <th>Opening</th>
              <th>Issues</th>
              <th>Waste</th>
              <th>Closing</th>
            </tr>
          </thead>
          <tbody>
            {formData.map((row, index) => (
              <tr key={row.raw_material_id}>
                <td>{row.name}</td>
                <td>{row.unit}</td>
                <td>
                  <input
                    type="number"
                    value={row.opening}
                    min="0"
                    onChange={(e) => handleChange(index, 'opening', e.target.value)}
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.issues}
                    min="0"
                    onChange={(e) => handleChange(index, 'issues', e.target.value)}
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.waste}
                    min="0"
                    onChange={(e) => handleChange(index, 'waste', e.target.value)}
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={row.closing}
                    min="0"
                    onChange={(e) => handleChange(index, 'closing', e.target.value)}
                    required
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Daily Inventory'}
        </button>
      </form>
    </div>
  );
};

export default MaterialPurchase;

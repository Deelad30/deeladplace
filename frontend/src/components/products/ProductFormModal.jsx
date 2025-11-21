import { useState, useEffect } from 'react';
import { vendorService } from '../../services/vendorService'; //

const ProductFormModal = ({ product, onClose, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    vendor_price: '',
    custom_commission: '',
    vendor_id: '' // add vendor selection
  });

  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const vendorList = await vendorService.getAllVendors(); // fetch from backend
        setVendors(vendorList.data.vendors);
        if (vendorList.length > 0 && !product) {
          setFormData(prev => ({ ...prev, vendor_id: vendorList[0].id }));
        }
      } catch (err) {
        console.error('Error fetching vendors', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVendors();
  }, [product]);

  useEffect(() => {
    if (product) setFormData(product);
  }, [product]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  await onSubmit(formData);
  setIsSubmitting(false);
  };

  if (loading) return <div>Loading...</div>;

  if (vendors.length === 0) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>No vendors available</h2>
          <p>You must create a vendor before adding a product.</p>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{product ? 'Edit Product' : 'Add Product'}</h2>
        <form onSubmit={handleSubmit}>
          <select
            name="vendor_id"
            value={formData.vendor_id}
            onChange={handleChange}
            required
          >
            <option selected value="" disabled>Select Vendor</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
          <input
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Description (Optional)"
          />
          <input
            name="vendor_price"
            value={formData.vendor_price}
            onChange={handleChange}
            placeholder="Price"
            type="number"
            required
          />
          <input
            name="custom_commission"
            value={formData.custom_commission}
            onChange={handleChange}
            placeholder="Commission (Optional)"
            type="number"
          />

          <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
          </button>

          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;

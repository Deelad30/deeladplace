import React, { useState } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";
import "./BrandingModal.css";

const BrandingModal = ({ visible, onClose }) => {
  const { user, updateTenantLogo } = useAuth();
  const [logoPreview, setLogoPreview] = useState(user?.tenant_logo || "");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async () => {
    if (!logoPreview) {
      toast.error("Please select a logo first");
      return;
    }

    setLoading(true);
    try {
      const res = await api.put("/auth/update-logo", { logo: logoPreview });
      if (res.data.success) {
        updateTenantLogo(logoPreview);
        toast.success("Business logo updated successfully");
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update logo");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete your business logo? This will revert to the default branding on receipts.")) return;

    setLoading(true);
    try {
      const res = await api.delete("/auth/delete-logo");
      if (res.data.success) {
        updateTenantLogo(null);
        setLogoPreview("");
        toast.success("Logo deleted successfully");
        onClose();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete logo");
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="branding-modal-overlay">
      <div className="branding-modal">
        <button className="modal-close-btn" onClick={onClose}>×</button>
        <h2>Business Branding Control</h2>
        <p>Manage your business logo for receipts and reports.</p>

        <div className="logo-management-section">
          <div className="logo-preview-container">
            {logoPreview ? (
              <img src={logoPreview} alt="Business Logo Preview" className="branding-logo-preview" />
            ) : (
              <div className="no-logo-placeholder">No Logo Uploaded</div>
            )}
          </div>

          <div className="upload-controls">
            <input
              type="file"
              id="branding-logo-upload"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
            <label htmlFor="branding-logo-upload" className="secondary-btn upload-btn">
              {logoPreview ? "Change Logo" : "Upload Logo"}
            </label>
            
            {user?.tenant_logo && (
              <button className="danger-btn delete-logo-btn" onClick={handleDelete} disabled={loading}>
                Delete Logo
              </button>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button className="primary-btn" onClick={handleUpdate} disabled={loading || !logoPreview}>
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrandingModal;

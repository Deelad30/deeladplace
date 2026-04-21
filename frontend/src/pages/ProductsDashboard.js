import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import Layout from "../components/common/Layout";
import { vendorService } from "../services/vendorService";
import TableSkeleton from "../components/common/TableSkeleton";
import {
  getProducts,
  createProduct,
  updateProductById,
  deleteProductById
} from "../api/products";
import Modal from "../components/common/Modal"; // Standard Modal
import { useNavigate } from "react-router-dom";
import { roundPrice } from "../utils/formatters";
import "../styles/shared/PremiumShared.css"; // Shared Premium Styles

// Import FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faCheckCircle, faMoneyBillWave, faFilter, faSearch } from "@fortawesome/free-solid-svg-icons";

// Helper for rounding
// Helper for smart rounding (nearest 100 for large numbers, integer for small)
const round = roundPrice;

const ProductsDashboard = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 20; 
  
  // Filters
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastAdded, setLastAdded] = useState(null); // Success feedback

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: 1,
    description: "",
    commission: "",
    vendor_id: "",
    vendor_price: ""
  });

  // Stats
  const [tilesLoading, setTilesLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);

  const navigate = useNavigate();

  const fetchVendors = useCallback(async () => {
    try {
      const response = await vendorService.getAllVendors();    
      if (response.data.success) {
        const sortedVendors = response.data.vendors.sort((a, b) => a.id - b.id);
        setVendors(sortedVendors);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  async function loadProducts() {
    setLoading(true);
    setTilesLoading(true);
    try {
      let allProducts = [];
      let currentPage = 1;
      const limit = 100;
      let totalCount = 0;

      do {
        const res = await getProducts(currentPage, limit);
        const prods = res.data.products || [];
        totalCount = res.data.totalCount || 0;
        allProducts = [...allProducts, ...prods];
        currentPage++;
      } while (allProducts.length < totalCount);

      setProducts(allProducts);

      // Compute stats
      setTotalProducts(allProducts.length);
      setActiveProducts(allProducts.length);
      const totalPrice = allProducts.reduce((acc, p) => {
        const basePrice = p.selling_price ? Number(p.selling_price) : Number(p.vendor_price || 0);
        const comm = Number(p.commission || p.custom_commission || 0);
        return acc + (basePrice + comm);
      }, 0);
      setAvgPrice(allProducts.length ? (totalPrice / allProducts.length).toFixed(2) : 0);
      
    } catch (err) {
      console.log(err);
      toast.error("Error loading products");
    } finally {
      setLoading(false);
      setTilesLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
    fetchVendors();
  }, [fetchVendors]);

  const handleSubmit = async () => {
    if (!formData.name) return toast.error("Product name is required");
    
    setActionLoading(true);
    try {
      const dataToSend = {
        ...formData,
        category_id: formData.category_id || 1,
        vendor_id: formData.vendor_id ? Number(formData.vendor_id) : null,
        vendor_price: parseFloat(formData.vendor_price) || 0,
        custom_commission: parseFloat(formData.commission) || 0
      };
      delete dataToSend.commission;

      if (editProduct) {
        await updateProductById(editProduct.id, dataToSend);
        toast.success("Product updated");
        setModalOpen(false);
      } else {
        await createProduct(dataToSend);
        toast.success("Product created. Add another?");
        setLastAdded(formData.name);
        
        // Reset form but keep vendor_id and category_id
        setFormData({
            name: "",
            sku: "",
            category_id: formData.category_id || 1,
            description: "",
            commission: "",
            vendor_id: formData.vendor_id,
            vendor_price: ""
        });
        // Keep modal open
      }

      loadProducts();
    } catch (err) {
      console.log(err);
      toast.error("Failed to save product");
    } finally {
        setActionLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category_id: 1, // Defaulting to 1 as per legacy code
      description: product.description,
      commission: product.custom_commission || product.commission || "",
      vendor_id: product.vendor_id || "",
      vendor_price: product.vendor_price || ""
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setActionLoading(true);
    try {
      await deleteProductById(id);
      toast.success("Product deleted");
      loadProducts();
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete product");
    } finally {
        setActionLoading(false);
    }
  };

  // Filter & Pagination
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase());
    const matchesVendor =
      !vendorFilter || Number(p.vendor_id) === Number(vendorFilter);
    return matchesSearch && matchesVendor;
  });

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  const currentPageProducts = filteredProducts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Layout>
      <div className="page-container">
        {actionLoading && <div className="loading-overlay"><div className="spinner"></div></div>}

        <div className="page-header">
          <h2 className="page-title">Products Dashboard</h2>
        </div>

        {/* --- Stats Tiles --- */}
        <div className="tiles-grid">
            <div className="stat-tile">
                <div className="stat-icon-container blue">
                    <FontAwesomeIcon icon={faBox} />
                </div>
                <div className="stat-info">
                    {tilesLoading ? <div className="spinner" style={{width:'20px', height:'20px'}}/> : <h3>{totalProducts}</h3>}
                    <p>Total Products</p>
                </div>
            </div>

            <div className="stat-tile">
                <div className="stat-icon-container green">
                    <FontAwesomeIcon icon={faCheckCircle} />
                </div>
                <div className="stat-info">
                    {tilesLoading ? <div className="spinner" style={{width:'20px', height:'20px'}}/> : <h3>{activeProducts}</h3>}
                    <p>Active Products</p>
                </div>
            </div>

            <div className="stat-tile">
                <div className="stat-icon-container orange">
                    <FontAwesomeIcon icon={faMoneyBillWave} />
                </div>
                <div className="stat-info">
                    {tilesLoading ? <div className="spinner" style={{width:'20px', height:'20px'}}/> : <h3>₦{round(avgPrice).toLocaleString()}</h3>}
                    <p>Avg. Customer Price</p>
                </div>
            </div>
        </div>

        {/* --- Toolbar --- */}
        <div className="page-header-actions">
           <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                <input
                    type="text"
                    className="search-bar"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                <select
                    className="filter-select"
                    value={vendorFilter}
                    onChange={(e) => { setVendorFilter(e.target.value); setPage(1); }}
                >
                    <option value="">All Vendors</option>
                    {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                </select>
           </div>
           
           <button
             className="premium-btn primary"
             onClick={() => {
               setEditProduct(null);
               setFormData({ name: "", sku: "", category_id: 1, description: "", commission: "", vendor_id: "", vendor_price: "" });
               setLastAdded(null);
               setModalOpen(true);
             }}
           >
             + Add Product
           </button>
        </div>

        {/* --- Table --- */}
        {loading ? (
             <TableSkeleton columns={[{key:'1'},{key:'2'},{key:'3'},{key:'4'},{key:'5'}]} rows={10} />
        ) : (
            <div className="table-container">
                {/* Desktop View */}
                <div className="premium-table-wrapper desktop-view" style={{ overflowX: 'auto', width: '100%', border: '1px solid #e2e8f0' }}>
                    <table className="premium-table" style={{ minWidth: '600px', width: '100%' }}>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>SKU</th>
                                <th>Customer Price</th>
                                <th>Vendor</th>
                                <th style={{textAlign:'right'}}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentPageProducts.length === 0 ? (
                                <tr><td colSpan="5" className="empty-state">No products found.</td></tr>
                            ) : (
                                currentPageProducts.map(p => {
                                    const vendorName = vendors.find(v => v.id === p.vendor_id)?.name || '-';
                                    const basePrice = p.selling_price ? Number(p.selling_price) : Number(p.vendor_price || 0);
                                    const comm = Number(p.commission || 0);
                                    const finalPrice = basePrice + comm;
                                    
                                    return (
                                        <tr key={p.id}>
                                            <td style={{fontWeight:'600', color:'#0f172a'}}>{p.name}</td>
                                            <td><span style={{background:'#f1f5f9', padding:'4px 8px', borderRadius:'6px', fontSize:'13px', color:'#64748b'}}>{p.sku || '-'}</span></td>
                                            <td>₦{finalPrice ? round(finalPrice).toLocaleString() : '-'}</td>
                                            <td>{vendorName}</td>
                                            <td style={{textAlign:'right'}}>
                                                <div className="actions-cell">
                                                    <button className="item-action-btn view" onClick={() => navigate(`/products/${p.id}/recipe`)}>
                                                        Recipe
                                                    </button>
                                                    <button className="item-action-btn edit" onClick={() => handleEdit(p)}>
                                                        Edit
                                                    </button>
                                                    <button className="item-action-btn delete" onClick={() => handleDelete(p.id)}>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View (Cards) */}
                <div className="mobile-view-cards">
                    {currentPageProducts.length === 0 ? (
                        <div className="empty-state" style={{textAlign:'center', padding:'20px'}}>No products found.</div>
                    ) : (
                        currentPageProducts.map(p => {
                             const vendorName = vendors.find(v => v.id === p.vendor_id)?.name || '-';
                             const basePrice = p.selling_price ? Number(p.selling_price) : Number(p.vendor_price || 0);
                             const comm = Number(p.commission || 0);
                             const finalPrice = basePrice + comm;

                             return (
                                <div key={p.id} className="premium-card" style={{padding:'16px', display:'flex', flexDirection:'column', gap:'12px'}}>
                                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                                        <div>
                                            <h4 style={{margin:0, fontSize:'16px', fontWeight:'700', color:'#1e293b'}}>{p.name}</h4>
                                            <span style={{background:'#f1f5f9', padding:'2px 6px', borderRadius:'4px', fontSize:'12px', color:'#64748b', marginTop:'4px', display:'inline-block'}}>{p.sku || 'No SKU'}</span>
                                        </div>
                                        <div style={{textAlign:'right'}}>
                                            <div style={{fontWeight:'700', color:'#1e293b'}}>₦{finalPrice ? round(finalPrice).toLocaleString() : '-'}</div>
                                            <div style={{fontSize:'12px', color:'#64748b'}}>{vendorName}</div>
                                        </div>
                                    </div>
                                    <div style={{display:'flex', gap:'8px', marginTop:'8px'}}>
                                         <button className="item-action-btn view" style={{flex:1, justifyContent:'center'}} onClick={() => navigate(`/products/${p.id}/recipe`)}>
                                            Recipe
                                         </button>
                                         <button className="item-action-btn edit" style={{flex:1, justifyContent:'center'}} onClick={() => handleEdit(p)}>
                                            Edit
                                         </button>
                                         <button className="item-action-btn delete" style={{flex:1, justifyContent:'center'}} onClick={() => handleDelete(p.id)}>
                                            Delete
                                         </button>
                                    </div>
                                </div>
                             );
                        })
                    )}
                </div>

                 {/* Pagination */}
                   {filteredProducts.length > pageSize && (
                    <div className="pagination-container">
                        <button 
                            className="page-btn" 
                            disabled={page === 1} 
                            onClick={() => setPage(p => p - 1)}
                        >Previous</button>
                        <span style={{fontSize:'14px', color:'#64748b'}}>Page {page} of {totalPages}</span>
                        <button 
                            className="page-btn" 
                            disabled={page === totalPages} 
                            onClick={() => setPage(p => p + 1)}
                        >Next</button>
                    </div>
                   )}
            </div>
        )}

        {/* --- Modal --- */}
        <Modal
            visible={modalOpen}
            onClose={() => { setModalOpen(false); setLastAdded(null); }}
            title={editProduct ? "Edit Product" : "New Product"}
        >
            <div className="vendor-form">
                {/* Success Banner */}
                {lastAdded && !editProduct && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#166534',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span style={{fontSize: '18px'}}>✓</span>
                        <div>
                            <strong>Success!</strong> Added <u>{lastAdded}</u>.
                            <div style={{fontSize: '12px', marginTop: '2px', opacity: 0.9}}>Ready for next item...</div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '4px' }}>
                    <div className="form-group">
                        <label className="premium-label-2">Product Name</label>
                        <input
                            className="premium-input"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g. Chicken Pie"
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label className="premium-label-2">SKU</label>
                            <input
                                className="premium-input"
                                value={formData.sku}
                                onChange={e => setFormData({ ...formData, sku: e.target.value })}
                                placeholder="store keeping unit-001"
                            />
                        </div>
                        <div className="form-group">
                              <label className="premium-label-2">Vendor Price</label>
                              <input
                                className="premium-input"
                                type="number"
                                value={formData.vendor_price}
                                onChange={e => setFormData({ ...formData, vendor_price: e.target.value })}
                                placeholder="0.00"
                              />
                        </div>
                        <div className="form-group">
                             <label className="premium-label-2">Commission</label>
                             <input
                                className="premium-input"
                                type="number"
                                value={formData.commission}
                                onChange={e => setFormData({ ...formData, commission: e.target.value })}
                                placeholder="0.00"
                             />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="premium-label-2">Vendor</label>
                        <select
                            className="premium-input"
                            value={formData.vendor_id}
                            onChange={e => setFormData({ ...formData, vendor_id: e.target.value })}
                        >
                            <option value="">Select Vendor</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="premium-label-2">Description</label>
                        <textarea
                            className="premium-input"
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Product details..."
                        />
                    </div>
                </div>

                <div style={{marginTop: '20px'}}>
                    <button className="submit-btn" onClick={handleSubmit} disabled={actionLoading}>
                        {actionLoading ? "Saving..." : (editProduct ? "Update Product" : "Create Product")}
                    </button>
                </div>
            </div>
        </Modal>

      </div>
    </Layout>
  );
};

export default ProductsDashboard;

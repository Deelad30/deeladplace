// src/pages/ProductsDashboard.jsx
import { useState, useEffect, useCallback } from 'react';
import { toast } from "react-hot-toast";
import Header from '../components/common/Header';
import { vendorService } from '../services/vendorService';
import TableSkeleton from '../components/common/TableSkeleton';
import Sidebar from '../components/common/Sidebar';
import {
  getProducts,
  createProduct,
  updateProductById,
  deleteProductById
} from '../api/products';
import Table from '../components/common/Table';
import Modals from '../components/common/Modals';
import { useNavigate } from 'react-router-dom';
import '../styles/pages/ProductsPage.css';

const ProductsDashboard = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20; // backend page size


  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

const [formData, setFormData] = useState({
  name: "",
  sku: "",
  category_id: 1, // default
  description: "",
  commission: "",  // optional
   vendor_id: ""
});

const fetchVendors = useCallback(async () => {
  try {
    const response = await vendorService.getAllVendors();    
    if (response.data.success) {
      const sortedVendors = response.data.vendors.sort((a, b) => a.id - b.id);
      setVendors(sortedVendors);
      
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

  const navigate = useNavigate();

  async function loadProducts(pageNumber = 1 ) {
    setLoading(true);
    try {
      const res = await getProducts(pageNumber);
       console.log("Raw API data:", res.data.products.map(p => ({name: p.name, created_at: p.created_at})));
      setProducts(res.data.products || []);
      setTotalCount(res.data.totalCount || 0);
      setPage(pageNumber);

    } catch (err) {
      console.log(err);
      toast.error('Error loading products');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadProducts(1);
    fetchVendors();
  }, [fetchVendors]);


  const handleSubmit = async () => {
  try {
    const dataToSend = {
      ...formData,
      category_id: formData.category_id || 1,
      vendor_id: formData.vendor_id ? Number(formData.vendor_id) : null,
      custom_commission: parseFloat(formData.commission) || 0, // map commission to custom_commission

    };

    // remove commission since backend does not recognize it
    delete dataToSend.commission;

    if (editProduct) {
      await updateProductById(editProduct.id, dataToSend);
      toast.success("Product updated");
    } else {
      await createProduct(dataToSend);
      toast.success("Product created");
    }

    setModalOpen(false);
    loadProducts();
  } catch (err) {
    console.log(formData);
    console.log(err);
    toast.error("Failed to save product");
  }
};



  const handleEdit = (product) => {
    console.log(product);
    
    setEditProduct(product);
setFormData({
  name: product.name,
  sku: product.sku,
  category_id: 1,
  description: product.description,
  commission: product.commission || "",
  vendor_id: product.vendor_id || ""
});

    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await deleteProductById(id);
      toast.success("Product deleted");
      loadProducts();
    } catch (err) {
      console.log(err);
      toast.error("Failed to delete product");
    }
  };

const columns = [
  { key: "name", label: "Name" },
  { key: "sku", label: "SKU" },
  { key: "category_id", label: "Category" },
  {
    key: "actions",
    label: "Actions",
    render: (row) => (
      <div className="actions-cell">
        <button
          className="btn-bright"
          onClick={() => navigate(`/products/${row.actions.id}/recipe`)}
        >
          Recipe
        </button>

        <button
          className="btn-light"
          onClick={() => handleEdit(row.actions)}
        >
          Edit
        </button>

        <button
          className="btn-danger"
          onClick={() => handleDelete(row.actions.id)}
        >
          Delete
        </button>
      </div>
    )
  }
];

  return (
    <div className="page-wrapper">
      <Header />
      <Sidebar />

      <main className="content-area">

        <div className="page-header">
          <h2 className="page-title">Products</h2>

          <button
            className="btn-primary"
            onClick={() => {
              setEditProduct(null);
              setFormData({
                name: "",
                sku: "",
                category_id: "",
                description: ""
              });
              setModalOpen(true);
            }}
          >
            + Add Product
          </button>
        </div>

        <div className="card">
          {loading ? (
            <TableSkeleton columns={columns} rows={pageSize} />
          ) : (
            <Table
              columns={columns}
              data={products.map(p => ({ ...p, actions: p }))}
            />
          )}

        </div>

              {totalCount > pageSize && (
  <div className="pagination">
    <button
      disabled={page === 1}
      onClick={() => loadProducts(page - 1)}
    >
      Prev
    </button>

    <span>
      Page {page} of {Math.ceil(totalCount / pageSize)}
    </span>

    <button
      disabled={page >= Math.ceil(totalCount / pageSize)}
      onClick={() => loadProducts(page + 1)}
    >
      Next
    </button>
  </div>
)}


      </main>

<Modals
  open={modalOpen}
  title={editProduct ? "Edit Product" : "New Product"}
  onClose={() => setModalOpen(false)}
>
  <div className="modal-form">

    <label>Product Name</label>
    <input
      value={formData.name}
      onChange={e => setFormData({ ...formData, name: e.target.value })}
    />

    <label>SKU</label>
    <input
      value={formData.sku}
      onChange={e => setFormData({ ...formData, sku: e.target.value })}
    />

    <label>Commission (optional)</label>
    <input
      type="number"
      placeholder="Enter commission"
      value={formData.commission || ""}
      onChange={e => setFormData({ ...formData, commission: e.target.value })}
    />

    <label>Vendor</label>
<select
  value={formData.vendor_id}
  onChange={(e) =>
    setFormData({ ...formData, vendor_id: e.target.value })
  }
  style={{
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #ccc",
    marginBottom: "12px"
  }}
>
  <option value="">Select Vendor</option>
  {vendors.map((vendor) => (
    <option key={vendor.id} value={vendor.id}>
      {vendor.name}
    </option>
  ))}
</select>


    <label>Description</label>
    <textarea
      value={formData.description}
      onChange={e => setFormData({ ...formData, description: e.target.value })}
      style={{
        width: "100%",
        padding: "10px",
        fontSize: "14px",
        borderRadius: "4px",
        border: "1px solid #ccc",
        minHeight: "80px",
        resize: "vertical"
      }}
    />

    <button className="btn-primary full-width" onClick={handleSubmit}>
      {editProduct ? "Update" : "Create"}
    </button>
  </div>
</Modals>

    </div>
  );
};

export default ProductsDashboard;

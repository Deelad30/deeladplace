import { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import Header from "../components/common/Header";
import { vendorService } from "../services/vendorService";
import TableSkeleton from "../components/common/TableSkeleton";
import Sidebar from "../components/common/Sidebar";
import {
  getProducts,
  createProduct,
  updateProductById,
  deleteProductById
} from "../api/products";
import Table from "../components/common/Table";
import Modals from "../components/common/Modals";
import { useNavigate } from "react-router-dom";
import "../styles/pages/ProductsPage.css";

// Import FontAwesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBox, faCheckCircle, faMoneyBillWave } from "@fortawesome/free-solid-svg-icons";

const ProductsDashboard = () => {
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20; 
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: 1,
    description: "",
    commission: "",
    vendor_id: ""
  });
 const round = (num, nearest = 100) => Math.round(num / nearest) * nearest;
  // For tiles
  const [tilesLoading, setTilesLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [activeProducts, setActiveProducts] = useState(0);
  const [avgPrice, setAvgPrice] = useState(0);

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

  const navigate = useNavigate();

 async function loadProducts() {
  setLoading(true);
  setTilesLoading(true);
  try {
    let allProducts = [];
    let page = 1;
    const limit = 100; // fetch 100 products per request to reduce number of requests
    let totalCount = 0;

    do {
      const res = await getProducts(page, limit);
      const prods = res.data.products || [];
      totalCount = res.data.totalCount || 0;

      allProducts = [...allProducts, ...prods];
      page++;
    } while (allProducts.length < totalCount);

    // Set products and total count
    setProducts(allProducts);
    setTotalCount(totalCount);

    // --- Compute tile stats for all products ---
    setTotalProducts(allProducts.length);
    setActiveProducts(allProducts.length);
    const totalPrice = allProducts.reduce(
      (acc, p) => acc + Number(p.selling_price || 0),
      0
    );
    setAvgPrice(allProducts.length ? (totalPrice / allProducts.length).toFixed(2) : 0);
  } catch (err) {
    console.log(err);
    toast.error("Error loading products");
  }

  setLoading(false);
  setTilesLoading(false);
}


  useEffect(() => {
    loadProducts();
    fetchVendors();
  }, [fetchVendors]);

  const handleSubmit = async () => {
    try {
      const dataToSend = {
        ...formData,
        category_id: formData.category_id || 1,
        vendor_id: formData.vendor_id ? Number(formData.vendor_id) : null,
        custom_commission: parseFloat(formData.commission) || 0
      };
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
      console.log(err);
      toast.error("Failed to save product");
    }
  };

  const handleEdit = (product) => {
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

  
const filteredProducts = products.filter(p => {
  const matchesSearch =
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku?.toLowerCase().includes(search.toLowerCase());

  const matchesVendor =
    !vendorFilter || Number(p.vendor_id) === Number(vendorFilter);

  return matchesSearch && matchesVendor;
});

const currentPageProducts = filteredProducts.slice(
  (page - 1) * pageSize,
  page * pageSize
);

  const columns = [
    { key: "name", label: "Name" },
    { key: "sku", label: "SKU" },
    { key: "category_id", label: "Category" },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="actions-cell">
          <button className="btn-bright" onClick={() => navigate(`/products/${row.actions.id}/recipe`)}>Recipe</button>
          <button className="btn-light" onClick={() => handleEdit(row.actions)}>Edit</button>
          <button className="btn-danger" onClick={() => handleDelete(row.actions.id)}>Delete</button>
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
                description: "",
                commission: "",
                vendor_id: ""
              });
              setModalOpen(true);
            }}
          >
            + Add Product
          </button>
        </div>

        {/* --- Tiles Row --- */}
        <div className="tiles-row">
          <div className="tile total-products">
            <div className="tile-icon">
              <FontAwesomeIcon icon={faBox} size="2x" />
            </div>
            <div className="tile-info">
              <span>Total Products</span>
              {tilesLoading ? <div className="tile-skeleton" /> : <h3>{totalProducts}</h3>}
            </div>
          </div>

          <div className="tile active-products">
            <div className="tile-icon">
              <FontAwesomeIcon icon={faCheckCircle} size="2x" />
            </div>
            <div className="tile-info">
              <span>Active Products</span>
              {tilesLoading ? <div className="tile-skeleton" /> : <h3>{activeProducts}</h3>}
            </div>
          </div>

          <div className="tile avg-price">
            <div className="tile-icon">
              <FontAwesomeIcon icon={faMoneyBillWave} size="2x" />
            </div>
            <div className="tile-info">
              <span>Average Selling Price</span>
              {tilesLoading ? <div className="tile-skeleton" /> : <h3>₦{round(avgPrice).toLocaleString()}</h3>}
            </div>
          </div>
        </div>
        <div
  style={{
    display: "flex",
    gap: "12px",
    marginBottom: "16px",
    flexWrap: "wrap"
  }}
>
  <input
    type="text"
    placeholder="Search by product name or SKU"
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setPage(1);
    }}
    style={{
      padding: "10px",
      minWidth: "220px",
      borderRadius: "4px",
      border: "1px solid #ccc"
    }}
  />

  <select
    value={vendorFilter}
    onChange={(e) => {
      setVendorFilter(e.target.value);
      setPage(1);
    }}
    style={{
      padding: "10px",
      minWidth: "200px",
      borderRadius: "4px",
      border: "1px solid #ccc"
    }}
  >
    <option value="">All Vendors</option>
    {vendors.map(v => (
      <option key={v.id} value={v.id}>
        {v.name}
      </option>
    ))}
  </select>
</div>

        <div className="card">
          {loading ? (
            <TableSkeleton columns={columns} rows={pageSize} />
          ) : (
            <Table columns={columns} data={currentPageProducts.map(p => ({ ...p, actions: p }))} />
          )}
        </div>
        {filteredProducts.length > pageSize && (
  <div className="pagination">
    <button 
      disabled={page === 1} 
      onClick={() => setPage(prev => prev - 1)}
    >
      Prev
    </button>
    <span>
      Page {page} of {Math.ceil(filteredProducts.length / pageSize)}
    </span>
    <button 
      disabled={page >= Math.ceil(filteredProducts.length / pageSize)} 
      onClick={() => setPage(prev => prev + 1)}
    >
      Next
    </button>
  </div>
)}


        {/* {totalCount > pageSize && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => loadProducts(page - 1)}>Prev</button>
            <span>Page {page} of {Math.ceil(totalCount / pageSize)}</span>
            <button disabled={page >= Math.ceil(totalCount / pageSize)} onClick={() => loadProducts(page + 1)}>Next</button>
          </div>
        )} */}
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
            onChange={e => setFormData({ ...formData, vendor_id: e.target.value })}
          >
            <option value="">Select Vendor</option>
            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>

          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
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

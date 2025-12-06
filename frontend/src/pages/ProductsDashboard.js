// src/pages/ProductsDashboard.jsx
import { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import Header from '../components/common/Header';
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
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category_id: "",
    description: ""
  });

  const navigate = useNavigate();

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await getProducts();
      setProducts(res.data.products || []);
    } catch (err) {
      console.log(err);
      toast.error('Error loading products');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSubmit = async () => {
    try {
      if (editProduct) {
        await updateProductById(editProduct.id, formData);
        toast.success("Product updated");
      } else {
        await createProduct(formData);
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
      category_id: product.category_id,
      description: product.description
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
          className="btn-outline"
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
            <div className="loading">Loading...</div>
          ) : (
            <Table
              columns={columns}
              data={products.map(p => ({ ...p, actions: p }))}
            />
          )}
        </div>

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

          <label>Category</label>
          <input
            value={formData.category_id}
            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
          />

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

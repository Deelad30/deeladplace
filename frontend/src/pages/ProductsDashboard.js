import { useState, useEffect } from 'react';
import { productService } from '../services/productService';
import DashboardTiles from '../components/products/DashboardTiles';
import ProductCharts from '../components/products/ProductCharts';
import ProductMainGrid from '../components/products/ProductMainGrid';
import { toast } from "react-hot-toast";
import ConfirmModal from '../components/common/ConfirmModal';
import ProductFormModal from '../components/products/ProductFormModal';
import Pagination from '../components/products/Pagination';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProductList from '../components/products/ProductList';
import '../../src/styles/pages/ProductsPage.css';

const ProductsDashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [summary, setSummary] = useState({});
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const filteredVendors = vendors.map(vendor => ({
    ...vendor,
    products: vendor.products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(v => v.products.length > 0);


  const fetchSummary = async () => {
    const res = await productService.getDashboardSummary();
    setSummary(res.summary);
  };

  const fetchProductsByVendor = async () => {
  const res = await productService.getProductsGroupedByVendor();
  setVendors(res.vendors); // vendors array with products nested
   };

  const fetchProducts = async (page = 1) => {
    const res = await productService.getAllProducts(page);
    setProducts(res.products);
    setCurrentPage(res.page);
    setTotalCount(res.totalCount);
  };

  useEffect(() => {
    fetchSummary();
    fetchProducts();
    fetchProductsByVendor();
  }, []);

const handleEdit = (product) => {
  setEditingProduct(product);
  setModalOpen(true);
};

const handleDelete = (vendorId, productId) => {

  const vendor = vendors.find(v => v.vendor_id === vendorId);

  if (!vendor) return;

  const product = vendor.products.find(p => p.id === productId);

  setDeleteProduct(product);
};

const confirmDelete = async () => {
  try {
    await productService.deleteProduct(deleteProduct.id);
    toast.success("Product deleted!");

    await fetchSummary();
    await fetchProducts(currentPage);
    await fetchProductsByVendor();
  } catch {
    toast.error("Failed to delete product");
  }
  setDeleteProduct(null);
};


  const handleModalClose = () => {
    setEditingProduct(null);
    setModalOpen(false);
  };

  const handleModalSubmit = async (productData) => {
  setIsProcessing(true);

  try {
    if (editingProduct) {
      await productService.updateProduct(editingProduct.id, productData);
      toast.success("Product updated!");
    } else {
      await productService.createProduct(productData);
      toast.success("Product created!");
      await fetchProductsByVendor();

    }

    await fetchSummary();
    await fetchProducts(currentPage);
    await fetchProductsByVendor();

    handleModalClose();
  } catch (err) {
    toast.error("Something went wrong");
  }

  setIsProcessing(false);
};


  return (
     <div className="products-page">
    <Header />
    <div className="page-content">
    <Sidebar />
    <main  className="main-content">
            {/* Header */}
      <div style={{ marginTop:"28px", marginLeft:"20px" }} className="vendor-top-container">
        <h2 className='vendor-top'>Products Dashboard</h2>
        
           <button className="create-btn" onClick={() => setModalOpen(true)}>Add a Product</button>
      </div>
    <div className="dashboard-container">
      <DashboardTiles summary={summary} />
         <input
      type="text"
      placeholder="Search products..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="search-input-1"
      style={{ padding: "8px 12px", marginRight: "15px", fontSize: "15px" }}
    />

      <ProductMainGrid
        vendors={filteredVendors}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <Pagination
        currentPage={currentPage}
        totalCount={totalCount}
        onPageChange={(page) => fetchProducts(page)}
      />
      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={handleModalClose}
          onSubmit={handleModalSubmit}
        />
      )}
      {deleteProduct && (
        <ConfirmModal
          message={`Delete ${deleteProduct.name}?`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteProduct(null)}
        />
      )}

    </div>
    </main>
    </div>
    </div>
  );
};

export default ProductsDashboard;

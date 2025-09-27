import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ProductList from '../components/products/ProductList';
import '../../src/styles/pages/ProductsPage.css';

const ProductsPage = () => {
  return (
    <div className="products-page">
      <Header />
      <div className="page-content">
        <Sidebar />
        <main className="main-content">
          <div className="content-header">
            <h1>Product Management</h1>
          </div>
          <ProductList />
        </main>
      </div>
    </div>
  );
};

export default ProductsPage;
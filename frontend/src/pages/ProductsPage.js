import React from 'react';
import Layout from '../components/common/Layout';
import ProductList from '../components/products/ProductList';
import '../../src/styles/pages/ProductsPage.css';

const ProductsPage = () => {
  return (
    <Layout>
          <div className="content-header">
            <h1>Product Management</h1>
          </div>
          <ProductList />
    </Layout>
  );
};

export default ProductsPage;
import React from 'react';
import Layout from '../components/common/Layout';
import VendorList from '../components/vendors/VendorList';
import '../../src/styles/pages/VendorsPage.css';

const VendorsPage = () => {
  return (
    <Layout>
      <VendorList />
    </Layout>
  );
};

export default VendorsPage;
import React from 'react';
import Layout from '../components/common/Layout';
import POS from '../components/pos/POS';
import { AppProvider } from '../context/AppContext';
import '../../src/styles/components/PricingSection.css';

const POSPage = () => {
  return (
    <AppProvider>
      <Layout>
            <POS />
      </Layout>
    </AppProvider>
  );
};

export default POSPage;
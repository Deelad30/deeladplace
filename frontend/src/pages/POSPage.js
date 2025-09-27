import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import POS from '../components/pos/POS';
import { AppProvider } from '../context/AppContext';
import '../../src/styles/pages/POSPage.css';

const POSPage = () => {
  return (
    <AppProvider>
      <div className="pos-page">
        <Header />
        <div className="page-content">
          <Sidebar />
          <main className="main-content">
            <POS />
          </main>
        </div>
      </div>
    </AppProvider>
  );
};

export default POSPage;
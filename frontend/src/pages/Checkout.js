import React from 'react';
import { AppProvider } from '../context/AppContext';
import '../../src/styles/components/PricingSection.css';
import PricingSection from '../components/pricingSection/PricingSection';

const CheckoutPage = () => {
    const user = JSON.parse(localStorage.getItem('user'));
  return (
    <AppProvider>
      <div className="pos-page">
        <div className="page-content">
          <main className="main-content">
            <PricingSection user={user} />
          </main>
        </div>
      </div>
    </AppProvider>
  );
};

export default CheckoutPage;
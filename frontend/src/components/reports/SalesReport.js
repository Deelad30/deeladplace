// src/components/reports/SalesReport.js
import React, { useEffect, useState } from 'react';
import { salesService } from '../../services/salesService';
import { vendorService } from '../../services/vendorService';
import { toast, Toaster } from 'react-hot-toast';

import KPISection from './components/KPISection';
import RevenueChart from './components/RevenueChart';
import CommissionChart from './components/CommissionChart';
import TopProductsChart from './components/TopProductsChart';
import PaymentBreakdownChart from './components/PaymentBreakdownChart';
import SalesTable from './components/SalesTable';
import FiltersBar from './components/FiltersBar';
import LoadingState from './components/LoadingState';

import '../../components/reports/styles/sales-report.css';

const SalesReport = () => {
  const [overview, setOverview] = useState({});
  const [summary, setSummary] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({});
  const [filters, setFilters] = useState({ start: null, end: null, vendor_id: null, payment_type: null });
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);

  // Fetch vendors once
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await vendorService.getAllVendors();
        if (res.data?.vendors) setVendors(res.data.vendors);
      } catch (err) {
        console.error('Failed to load vendors', err);
      }
    };
    fetchVendors();
  }, []);

  // Fetch sales data
const fetchAll = async (localFilters = {}) => {
  setLoading(true);
  try {
    const params = {};

    if (localFilters.startDate) {
      params.start = localFilters.startDate;
    }

    if (localFilters.endDate) {
      params.end = localFilters.endDate;
    }

    if (localFilters.vendor_id) params.vendor_id = localFilters.vendor_id;
    if (localFilters.payment_type) params.payment_type = localFilters.payment_type;

    const [overviewRes, summaryRes, topRes, paymentRes] = await Promise.all([
      salesService.getOverview(params),
      salesService.getSalesSummary(params),
      salesService.getTopProducts({ ...params, limit: 8 }),
      salesService.getPaymentSummary(params)
    ]);

    setOverview(overviewRes.overview || overviewRes);
    setSummary(summaryRes.summary || []);
    setTopProducts(topRes.top_products || []);
    setPaymentSummary(paymentRes.payment_summary || {});
    console.log(topProducts);
    
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};



// Apply filters from FiltersBar
// In SalesReport.js
const onApplyFilters = (newFilters) => {
  // Map start/end to startDate/endDate for backend
  const formattedFilters = {
    ...newFilters,
    startDate: newFilters.start || null,
    endDate: newFilters.end || null,
  };

  setFilters(formattedFilters);
  toast('Filters applied', { icon: '⚡' });
  fetchAll(formattedFilters);
};



  // Fetch data on mount
  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div style={{ marginTop: "-50px" }} className="reports-container">
      <div className="expense-report-container">
        <h2 className="report-title">Sales Report</h2>
      </div>

      <Toaster position="top-right" />

      <div className="reports-inner">
        <FiltersBar onApply={onApplyFilters} vendors={vendors} current={filters} />

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <KPISection overview={overview} />

            <div className="charts-row" style={{ marginTop: 6 }}>
              <div className="chart-card">
                <div className="chart-title">Revenue (last 30 days)</div>
                <RevenueChart data={summary} />
              </div>

              <div className="chart-card">
                <div className="chart-title">Commission (last 30 days)</div>
                <CommissionChart data={summary} />
              </div>
            </div>

            <div className="insights-row" style={{ marginTop: 12 }}>
              <div className="chart-card">
                <div className="chart-title">Top Products</div>
                <TopProductsChart data={topProducts} />
              </div>

              <div className="chart-card">
                <div className="chart-title">Payment Breakdown</div>
                <PaymentBreakdownChart data={paymentSummary} />
              </div>
            </div>

            <div className="table-card" style={{ marginTop: 12 }}>
              <div className="table-header">
                <h3 style={{ fontWeight: 700 }}>Sales Report</h3>
                <div style={{ color: 'var(--color-muted)', fontSize: 13 }}>Complete listing with filters</div>
              </div>

              <SalesTable vendors={vendors} filters={filters} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesReport;

// src/components/reports/SalesReport.js
import React, { useEffect, useState } from 'react';
import { salesService } from '../../services/salesService';
import KPISection from './components/KPISection';
import RevenueChart from './components/RevenueChart';
import { vendorService } from '../../services/vendorService';
import CommissionChart from './components/CommissionChart';
import TopProductsChart from './components/TopProductsChart';
import PaymentBreakdownChart from './components/PaymentBreakdownChart';
import SalesTable from './components/SalesTable';
import FiltersBar from './components/FiltersBar';
import LoadingState from './components/LoadingState';
import { toast, Toaster } from 'react-hot-toast';
import '../../components/reports/styles/sales-report.css';

const SalesReport = () => {
  const [overview, setOverview] = useState(null);
  const [summary, setSummary] = useState([]); // daily summary
  const [topProducts, setTopProducts] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({});
  const [filters, setFilters] = useState({ start: null, end: null, vendor_id: null, payment_type: null });
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);

  const fetchAll = async (localFilters = {}) => {
    setLoading(true);
    try {
      const [overviewRes, summaryRes, topRes, paymentRes] = await Promise.all([
        salesService.getOverview(),
        salesService.getSalesSummary(),
        salesService.getTopProducts({ start: localFilters.start, end: localFilters.end, limit: 8 }),
        salesService.getPaymentSummary({ start: localFilters.start, end: localFilters.end }),
      ]);

      setOverview(overviewRes.overview || overviewRes);
      setSummary(summaryRes.summary || []);
      setTopProducts(topRes.top_products || []);
      setPaymentSummary(paymentRes.payment_summary || {});
    } catch (err) {
      console.error(err);
      toast.error('Failed to load analytics. Try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll(filters);
   
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

  const onApplyFilters = (newFilters) => {
    setFilters(newFilters);
    toast('Filters applied', { icon: '⚡' });
    fetchAll(newFilters);
  };

  return (
    <div className="reports-container">
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
              {/* CSV Export */}
     

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

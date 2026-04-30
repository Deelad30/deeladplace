// src/components/reports/SalesReport.js
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { salesService } from '../../services/salesService';
import { vendorService } from '../../services/vendorService';
import { getUsers } from '../../api/users';
import { toast, Toaster } from 'react-hot-toast';

import KPISection from './components/KPISection';
import SalesTrendsChart from './components/SalesTrendsChart';
import VendorProductChart from './components/VendorProductChart';
import TopProductsChart from './components/TopProductsChart';
import PaymentBreakdownChart from './components/PaymentBreakdownChart';
import CustomerTypeSummaryChart from './components/CustomerTypeSummaryChart';
import SalesTable from './components/SalesTable';
import VendorPerformanceChart from './components/VendorPerformanceChart';
import FiltersBar from './components/FiltersBar';
import LoadingState from './components/LoadingState';
// Add at the top
import { exportCSV, exportExcel, exportPDF } from "../../utils/exportHelpers";

import '../../components/reports/styles/sales-report.css';

const SalesReport = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState({});
  const [summary, setSummary] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [vendorPerformance, setVendorPerformance] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({});
  const [customerTypeSummary, setCustomerTypeSummary] = useState({});
  
  const now = new Date();
  const today = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(now);
  const firstDay = today.substring(0, 8) + '01';

  const [filters, setFilters] = useState({ 
    start: firstDay, 
    end: today, 
    vendor_id: null, 
    payment_type: null, 
    user_id: null,
    startDate: firstDay, 
    endDate: today 
  });
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]);

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
    const fetchUsers = async () => {
      try {
        const res = await getUsers();
        if (res.data?.users) setUsers(res.data.users);
      } catch (err) {
        console.error('Failed to load users', err);
      }
    };
    fetchVendors();
    fetchUsers();
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
    if (localFilters.user_id) params.user_id = localFilters.user_id;

    const [overviewRes, summaryRes, topRes, paymentRes, performanceRes, customerTypeRes] = await Promise.all([
      salesService.getOverview(params),
      salesService.getSalesSummary(params),
      salesService.getTopProducts({ ...params, limit: 8 }),
      salesService.getPaymentSummary(params),
      salesService.getVendorPerformance(params),
      salesService.getCustomerTypeSummary(params)
    ]);

    setOverview(overviewRes.overview || overviewRes);
    setSummary(summaryRes.summary || []);
    setTopProducts(topRes.top_products || []);
    setPaymentSummary(paymentRes.payment_summary || {});
    setVendorPerformance(performanceRes.vendor_performance || []);
    setCustomerTypeSummary(customerTypeRes.customer_type_summary || {});
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
    fetchAll(filters);
    // eslint-disable-next-line
  }, []);

  const [auditMode, setAuditMode] = useState(false);

  return (
    <div style={{ marginTop: "-50px" }} className="reports-container">
      <div className="expense-report-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="report-title">Sales Report</h2>
        
        <div className="audit-toggle-container" style={{ marginLeft: 0 }}>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={auditMode} 
              onChange={() => setAuditMode(!auditMode)} 
            />
            <span className="slider round"></span>
          </label>
          <span className="audit-label">Audit Mode {auditMode ? "ON" : "OFF"}</span>
        </div>
      </div>

      <Toaster position="top-right" />

      <div className="reports-inner">
        <FiltersBar onApply={onApplyFilters} vendors={vendors} users={users} current={filters} />

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <KPISection overview={overview} auditMode={auditMode} />

            {/* Top Trends Row */}
            <div className="charts-row" style={{ marginTop: 6, display: 'grid', gridTemplateColumns: filters.vendor_id ? '1.5fr 1fr' : '1fr', gap: 16 }}>
              <div className="chart-card">
                <div className="chart-title">Sales Trends (Revenue & Commission)</div>
                <SalesTrendsChart data={summary} />
              </div>
              
              {filters.vendor_id && (
                <div className="chart-card">
                  <div className="chart-title">Product Breakdown (Units Sold)</div>
                  <VendorProductChart data={topProducts} auditMode={auditMode} />
                </div>
              )}
            </div>

            {/* Performance & Products Row */}
            <div 
              className="insights-row" 
              style={{ 
                marginTop: 12, 
                display: 'grid', 
                gridTemplateColumns: filters.vendor_id ? '1fr 1fr' : '1fr', 
                gap: 16 
              }}
            >
              <div className="chart-card">
                <div className="chart-title">
                  {filters.vendor_id ? 'Vendor Revenue Performance' : 'Overall Vendor Revenue Comparison'}
                </div>
                <VendorPerformanceChart data={vendorPerformance} />
              </div>

              <div className="chart-card">
                <div className="chart-title">
                  {filters.vendor_id ? 'Vendor Top Selling Products' : 'Overall Top Selling Products'}
                </div>
                <TopProductsChart data={topProducts} />
              </div>
            </div>

            {/* Secondary Insights Row */}
            <div className="insights-row" style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="chart-card">
                <div className="chart-title">Payment Breakdown Summary</div>
                <PaymentBreakdownChart data={paymentSummary} />
              </div>
              <div className="chart-card">
                <div className="chart-title">Customer Type Summary</div>
                <CustomerTypeSummaryChart data={customerTypeSummary} />
              </div>
            </div>

            <div className="table-card" style={{ marginTop: 12 }}>
   <div className="table-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <div>
    <h3 style={{ fontWeight: 700 }}>Sales Report</h3>
    <div style={{ color: 'var(--color-muted)', fontSize: 13 }}>Complete listing with filters</div>
  </div>

  <div style={{ display: "flex", gap: 10 }}>
    <button
      className="page-btn"
      onClick={async () => {
        const all = await salesService.getAllSalesNoPagination(filters);
        exportCSV(all.items, "sales.csv");
      }}
    >
      CSV
    </button>

    <button
      className="page-btn"
      onClick={async () => {
        const all = await salesService.getAllSalesNoPagination(filters);
        exportExcel(all.items, "sales.xlsx");
      }}
    >
      Excel
    </button>

    <button
      className="page-btn"
      onClick={async () => {
        const all = await salesService.getAllSalesNoPagination(filters);
        exportPDF(all.items, "sales.pdf", vendors, user?.tenant_logo);
      }}
    >
      PDF
    </button>
  </div>
</div>


              <SalesTable vendors={vendors} filters={filters} auditMode={auditMode} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalesReport;

import React, { useEffect, useState } from "react";
import { sicService } from "../../../services/profitService";
import { productService } from "../../../services/productService";
import { vendorService } from "../../../services/vendorService";
import SkeletonCard from "../../../components/common/SkeletonCard";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { exportToCSV, exportToPDF } from "../../../utils/profitExport";
import "../styles/sic-report.css";

const SICProductReport = () => {
  const [loading, setLoading] = useState(true);
  const [productSIC, setProductSIC] = useState([]);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    createdBy: "",
    productId: "",
    vendorId: "",
  });
  
  const [auditMode, setAuditMode] = useState(false);
  const round100 = (num) => Math.round((num || 0) / 100) * 100;

  const loadSIC = async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const res = await sicService.getProductSICReport(cleanFilters);    
      if (res.data.success) setProductSIC(res.data.report);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Product SIC report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSIC();
     // eslint-disable-next-line 
  }, []);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [prodRes, vendRes] = await Promise.all([
          productService.getAllProducts(),
          vendorService.getAllVendors()
        ]);
        if (prodRes.data.success) setProducts(prodRes.data.products);
        if (vendRes.data.success) setVendors(vendRes.data.vendors);
      } catch (err) {
        console.error(err);
      }
    };
    loadInitialData();
  }, []);

  const top5Variance = [...productSIC]
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 5);

  return (
    <div className="sic-container">
      <h2 className="page-title">Product SIC Report</h2>

      <div className="profit-filters">
        <input type="date" onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
        <input type="date" onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        <select onChange={e => setFilters(f => ({ ...f, productId: e.target.value }))}>
          <option value="">All Products</option>
          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select onChange={e => setFilters(f => ({ ...f, vendorId: e.target.value }))}>
          <option value="">All Vendors</option>
          {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
        <button onClick={loadSIC}>Apply</button>

        <div className="audit-toggle-container">
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

      <div className="export-actions">
        <button onClick={() => {
          const headers = ["Product", "Opening", "Produced", "Waste", "Closing", "Actual Sales", "Expected Expected", "Variance", "Value"];
          const rows = productSIC.map(p => [
            p.product_name || `ID: ${p.product_id}`,
            p.opening_qty,
            p.issues_qty,
            p.waste_qty,
            p.closing_qty,
            p.system_sales,
            p.expected_sales,
            p.variance,
            p.variance_value
          ]);
          exportToCSV(headers, rows, "product_sic_report.csv");
        }}>CSV</button>

        <button onClick={() => {
          const headers = ["Product", "Opening", "Produced", "Waste", "Closing", "Actual Sales", "Expected Expected", "Variance", "Value"];
          const rows = productSIC.map(p => [
            p.product_name || `ID: ${p.product_id}`,
            p.opening_qty,
            p.issues_qty,
            p.waste_qty,
            p.closing_qty,
            p.system_sales,
            p.expected_sales,
            p.variance,
            p.variance_value
          ]);
          exportToPDF("Product SIC Report", headers, rows, "product_sic_report.pdf");
        }}>PDF</button>
      </div>
      {loading ? (
        <SkeletonCard height={300} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top5Variance}>
            <XAxis dataKey="product_id" />
            <YAxis />
            <Tooltip formatter={(value) => value} />
            <Bar dataKey="variance">
              {top5Variance.map((_, i) => (
                <Cell key={i} fill="#4d70ff" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      <div className="grid">
        {loading ? (
          <SkeletonCard height={150} />
        ) : (
          productSIC.map(p => {
            const variance = auditMode ? p.variance : Math.round(p.variance);
            const varianceValue = auditMode ? p.variance_value : round100(p.variance_value);

            return (
              <div key={p.id} className={`sic-report-card ${auditMode ? 'audit-border' : ''}`}>
                <h4>{p.product_name || `ID: ${p.product_id}`}</h4>
                <p>Opening: {p.opening_qty}</p>
                <p>Produced: {p.issues_qty}</p>
                <p>Waste: {p.waste_qty}</p>
                <p>Closing: {p.closing_qty}</p>
                <hr />
                <p>Actual Sales: <strong>{p.system_sales}</strong></p>
                <p>Expected Sales (System): <strong>{p.expected_sales}</strong></p>
                <strong className={p.variance >= 0 ? "profit" : "loss"}>
                  Variance: {variance} (₦{Number(varianceValue).toLocaleString(undefined, { maximumFractionDigits: auditMode ? 2 : 0 })})
                </strong>
                <div className={`remark-badge ${p.variance < 0 ? 'over' : (p.variance > 0 ? 'under' : 'good')}`}>
                    {p.variance < 0 ? 'Missing sales' : (p.variance > 0 ? 'Overring' : 'Good')}
                </div>
                {p.override_reason && <small>Override: {p.override_reason}</small>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SICProductReport;

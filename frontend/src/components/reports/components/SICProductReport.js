import React, { useEffect, useState } from "react";
import { sicService } from "../../../services/profitService";
import { productService } from "../../../services/productService";
import SkeletonCard from "../../../components/common/SkeletonCard";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { exportToCSV, exportToPDF } from "../../../utils/profitExport";
import "../styles/sic-report.css";

const SICProductReport = () => {
  const [loading, setLoading] = useState(true);
  const [productSIC, setProductSIC] = useState([]);
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    createdBy: "",
    productId: "",
  });

  const loadSIC = async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const res = await sicService.getProductSICReport(cleanFilters);
      if (res.data.success) setProductSIC(res.data.sic);
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
    const loadProducts = async () => {
      try {
        const res = await productService.getAllProducts();
        if (res.data.success) setProducts(res.data.products);
      } catch (err) {
        console.error(err);
      }
    };
    loadProducts();
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
        <button onClick={loadSIC}>Apply</button>
      </div>

      <div className="export-actions">
        <button onClick={() => exportToCSV(productSIC, "product_sic.csv")}>CSV</button>
        <button onClick={() => exportToPDF(productSIC, "Product SIC Report")}>PDF</button>
      </div>

      <h3 className="section-title">Top 5 Variances</h3>
      {loading ? (
        <SkeletonCard height={300} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top5Variance}>
            <XAxis dataKey="product_id" />
            <YAxis />
            <Tooltip formatter={(value) => value.toFixed(2)} />
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
          productSIC.map(p => (
            <div key={p.id} className="product-card">
              <h4>{p.product_name || `ID: ${p.product_id}`}</h4>
              <p>Opening: {p.opening_qty}</p>
              <p>Produced: {p.issues_qty}</p>
              <p>Waste: {p.waste_qty}</p>
              <p>Closing: {p.closing_qty}</p>
              <p>Expected: {p.expected_sales}</p>
              <p>System: {p.system_sales}</p>
              <strong className={p.variance >= 0 ? "profit" : "loss"}>
                Variance: {p.variance.toFixed(2)} ({p.variance_value.toFixed(2)})
              </strong>
              {p.override_reason && <small>Override: {p.override_reason}</small>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SICProductReport;

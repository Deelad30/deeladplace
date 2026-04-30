import React, { useEffect, useState } from "react";
import { profitService } from "../../../services/profitService";
import { vendorService } from "../../../services/vendorService";
import SkeletonCard from "../../../components/common/SkeletonCard";
import toast from "react-hot-toast";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { exportToCSV, exportToPDF } from "../../../utils/profitExport";
import "../styles/product-profit.css";

const ProfitReport = () => {
  const [loading, setLoading] = useState(true);
  const [netProfit, setNetProfit] = useState(null);
  const [products, setProducts] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    vendorId: "",
    categoryId: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
        const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
        );
        const [netRes, prodRes] = await Promise.all([
            profitService.getNetProfit(cleanFilters),
            profitService.getProductProfitability(cleanFilters),
            ]);

      console.log(netRes, prodRes);
      setNetProfit(netRes.data.summary);
      setProducts(prodRes.data.items || []);
    } catch (err) {
      toast.error("Failed to load profit report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const loadVendors = async () => {
      const res = await vendorService.getAllVendors();
      if (res.data.success) setVendors(res.data.vendors);
    };
    loadVendors();
  }, []);

  const [auditMode, setAuditMode] = useState(false);
  const round100 = (num) => Math.round((num || 0) / 100) * 100;

  const enrichedProducts = products.map(p => {
    const roundedProfit = round100(p.gross_profit);
    return {
      ...p,
      rounded_profit: roundedProfit,
      profit_margin: p.total_sales > 0 ? ((p.gross_profit / p.total_sales) * 100) : 0,
    };
  });

  // EXACT Database Truth (Audit Mode ON)
  const exactTotalProductProfit = products.reduce((sum, p) => sum + Number(p.gross_profit), 0);
  const exactNetProfit = Number(netProfit?.net_profit || 0);

  // ROUNDED Consistency (Audit Mode OFF)
  const totalRoundedProductProfit = enrichedProducts.reduce((sum, p) => sum + p.rounded_profit, 0);
  const totalRoundedSales = enrichedProducts.reduce((sum, p) => sum + round100(p.total_sales), 0);
  const roundedExpenses = round100(netProfit?.total_expenses);
  
  // User requested Net Profit = Total Sales - Total Expenses (ignoring COGS)
  const consistentNetProfit = totalRoundedSales - roundedExpenses;

  // Values to display based on Audit Mode
  const displayProductProfit = auditMode ? exactTotalProductProfit : totalRoundedProductProfit;
  const displayNetProfit = auditMode ? exactNetProfit : consistentNetProfit;

  const top5 = [...enrichedProducts]
    .sort((a, b) => b.gross_profit - a.gross_profit)
    .slice(0, 5);

  return (
    <div className="profit-container">
      <h2 className="page-title">Profit Report</h2>

      {/* Filters */}
      <div className="profit-filters">
        <div className="filter-group">
            <label>From:</label>
            <input type="date" onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} />
        </div>
        <div className="filter-group">
            <label>To:</label>
            <input type="date" onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} />
        </div>

        <select onChange={e => setFilters(p => ({ ...p, vendorId: e.target.value }))}>
          <option value="">All Vendors</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        <button className="apply-btn" onClick={loadData}>Apply Filters</button>

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

      {/* Export */}
      <div className="export-actions">
        <button onClick={() => {
          const headers = ["Product", "Sales", "Cost", "Profit", "Margin %"];
          const rows = enrichedProducts.map(p => [
            p.product_name,
            p.total_sales,
            p.total_cost,
            p.gross_profit,
            `${p.profit_margin.toFixed(1)}%`
          ]);
          exportToCSV(headers, rows, "profit_report.csv");
        }}>CSV</button>

        <button onClick={() => {
          const headers = ["Product", "Sales", "Cost", "Profit", "Margin %"];
          const rows = enrichedProducts.map(p => [
            p.product_name,
            p.total_sales,
            p.total_cost,
            p.gross_profit,
            `${p.profit_margin.toFixed(1)}%`
          ]);
          const summary = `Net Profit: ₦${Number(netProfit?.net_profit || 0).toLocaleString()}`;
          exportToPDF("Profit Report", headers, rows, "profit_report.pdf", summary);
        }}>PDF</button>
      </div>

      {/* Profit Cards */}
      <div className="profit-summary-cards">
        {loading ? (
          <SkeletonCard height={90} />
        ) : (
          <>
            <div className={`net-profit-card ${auditMode ? 'audit-border' : ''}`}>
              <h3>Cumulative Product Profit</h3>
              <strong className={displayProductProfit >= 0 ? "profit" : "loss"}>
                ₦{displayProductProfit.toLocaleString(undefined, { maximumFractionDigits: auditMode ? 2 : 0 })}
              </strong>
              {auditMode && <small className="audit-hint">Exact Database Total</small>}
            </div>

            <div className={`net-profit-card ${auditMode ? 'audit-border' : ''}`}>
              <h3>Cumulative Net Profit {auditMode ? "" : "(Rounded)"}</h3>
              <strong className={displayNetProfit >= 0 ? "profit" : "loss"}>
                ₦{displayNetProfit.toLocaleString(undefined, { maximumFractionDigits: auditMode ? 2 : 0 })}
              </strong>
              {auditMode && <small className="audit-hint">Exact Database Total</small>}
            </div>
          </>
        )}
      </div>

      {/* Bar Chart */}
      <h3 className="section-title">Top 5 Profitable Products</h3>

      {loading ? (
        <SkeletonCard height={300} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top5}>
            <XAxis dataKey="product_name" />
            <YAxis />
            <Tooltip 
              formatter={(value) => `₦${Number(auditMode ? value : round100(value)).toLocaleString()}`}
            />
            <Bar dataKey="gross_profit">
              {top5.map((_, i) => (
                <Cell key={i} fill="#4d70ff" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      {/* Product Cards */}
      <div className="grid">
        {enrichedProducts.map(p => {
          const sales = auditMode ? p.total_sales : round100(p.total_sales);
          const cost = auditMode ? p.total_cost : round100(p.total_cost);
          const profit = auditMode ? p.gross_profit : p.rounded_profit;

          return (
            <div key={p.product_id} className={`profit-report-card ${auditMode ? 'audit-border' : ''}`}>
              <h4>{p.product_name}</h4>
              <p>Sales: ₦{Number(sales).toLocaleString(undefined, { maximumFractionDigits: auditMode ? 2 : 0 })}</p>
              <p>Cost: ₦{Number(cost).toLocaleString(undefined, { maximumFractionDigits: auditMode ? 2 : 0 })}</p>
              <strong className={profit >= 0 ? "profit" : "loss"}>
                Profit: ₦{Number(profit).toLocaleString(undefined, { maximumFractionDigits: auditMode ? 2 : 0 })}
              </strong>
              <small>Margin: {Number(p.profit_margin).toFixed(1)}%</small>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfitReport;

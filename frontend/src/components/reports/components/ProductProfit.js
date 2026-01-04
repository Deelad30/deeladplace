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
  const round = (num, nearest = 100) => Math.round(num / nearest) * nearest;

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

  const enrichedProducts = products.map(p => ({
    ...p,
    profit_margin:
      p.total_sales > 0
        ? ((p.gross_profit / p.total_sales) * 100).toFixed(2)
        : 0,
  }));

  const top5 = [...enrichedProducts]
    .sort((a, b) => b.gross_profit - a.gross_profit)
    .slice(0, 5);

  return (
    <div className="profit-container">
      <h2 className="page-title">Profit Report</h2>

      {/* Filters */}
      <div className="profit-filters">
        <input type="date" onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} />
        <input type="date" onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} />

        <select onChange={e => setFilters(p => ({ ...p, vendorId: e.target.value }))}>
          <option value="">All Vendors</option>
          {vendors.map(v => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>

        <button onClick={loadData}>Apply</button>
      </div>

      {/* Export */}
      <div className="export-actions">
        <button onClick={() => exportToCSV(enrichedProducts)}>CSV</button>
        <button onClick={() => exportToPDF(enrichedProducts, netProfit)}>PDF</button>
      </div>

      {/* Net Profit */}
      {loading ? (
        <SkeletonCard height={90} />
      ) : (
        <div className="net-profit-card">
          <h3>Cumulative Net Profit</h3>
          {netProfit && (
            <strong className={netProfit.net_profit >= 0 ? "profit" : "loss"}>
                ₦{Number(round(netProfit.net_profit) || 0).toLocaleString()}
            </strong>
            )}

        </div>
      )}

      {/* Bar Chart */}
      <h3 className="section-title">Top 5 Profitable Products</h3>

      {loading ? (
        <SkeletonCard height={300} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top5}>
            <XAxis dataKey="product_name" />
            <YAxis />
            <Tooltip />
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
        {enrichedProducts.map(p => (
          <div key={p.product_id} className="product-card">
            <h4>{p.product_name}</h4>
            <p>Sales: ₦{Number(round(p.total_sales)).toLocaleString()}</p>
            <p>Cost: ₦{Number(round(p.total_cost)).toLocaleString()}</p>
            <strong className={round(p.gross_profit >= 0 ? "profit" : "loss")}>
              Profit: ₦{Number(round(p.gross_profit)).toLocaleString()}
            </strong>
            <small>Margin: {round(p.profit_margin)}%</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfitReport;

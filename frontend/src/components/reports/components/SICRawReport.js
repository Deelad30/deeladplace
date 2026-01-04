import React, { useEffect, useState } from "react";
import { sicService } from "../../../services/profitService"; // or separate sicService file
import { vendorService } from "../../../services/vendorService";
import SkeletonCard from "../../../components/common/SkeletonCard";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { exportToCSV, exportToPDF } from "../../../utils/profitExport";
import "../styles/sic-report.css";

const SICRawReport = () => {
  const [loading, setLoading] = useState(true);
  const [rawSIC, setRawSIC] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    createdBy: "",
    materialId: "",
  });

  // Load SIC data
  const loadSIC = async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      const res = await sicService.getRawSICReport(cleanFilters);
      if (res.data.success) setRawSIC(res.data.sic);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load Raw SIC report");
    } finally {
      setLoading(false);
    }
  };

  // Load materials for filter dropdown
  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const res = await materialService.getAllMaterials(); // implement getAllMaterials in service
        if (res.data.success) setMaterials(res.data.materials);
      } catch (err) {
        console.error(err);
      }
    };
    loadMaterials();
  }, []);

  useEffect(() => {
    loadSIC();
    // eslint-disable-next-line 
  }, []);

  // Top 5 absolute variance for chart
  const top5Variance = [...rawSIC]
    .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
    .slice(0, 5);

  return (
    <div className="sic-container">
      <h2 className="page-title">Raw Materials SIC Report</h2>

      {/* Filters */}
      <div className="profit-filters">
        <input type="date" onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))} />
        <input type="date" onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))} />
        <select onChange={e => setFilters(f => ({ ...f, materialId: e.target.value }))}>
          <option value="">All Materials</option>
          {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <button onClick={loadSIC}>Apply</button>
      </div>

      {/* Export */}
      <div className="export-actions">
        <button onClick={() => exportToCSV(rawSIC, "raw_sic.csv")}>CSV</button>
        <button onClick={() => exportToPDF(rawSIC, "Raw SIC Report")}>PDF</button>
      </div>

      {/* Bar Chart */}
      <h3 className="section-title">Top 5 Variances</h3>
      {loading ? (
        <SkeletonCard height={300} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={top5Variance}>
            <XAxis dataKey="material_id" />
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

      {/* Cards */}
      <div className="grid">
        {loading ? (
          <SkeletonCard height={150} />
        ) : (
          rawSIC.map(r => (
            <div key={r.id} className="product-card">
              <h4>{r.material_name || `ID: ${r.material_id}`}</h4>
              <p>Opening: {r.opening_qty}</p>
              <p>Issued: {r.issues_qty}</p>
              <p>Waste: {r.waste_qty}</p>
              <p>Closing: {r.closing_qty}</p>
              <p>Expected: {r.expected_usage}</p>
              <p>System: {r.system_usage}</p>
              <strong className={r.variance >= 0 ? "profit" : "loss"}>
                Variance: {r.variance.toFixed(2)} ({r.variance_value.toFixed(2)})
              </strong>
              {r.override_reason && <small>Override: {r.override_reason}</small>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SICRawReport;

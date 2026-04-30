import React, { useEffect, useState } from "react";
import { sicService } from "../../../services/profitService"; // or separate sicService file
import { vendorService } from "../../../services/vendorService"; // implement materialService
 import { materialService } from "../../../services/materialService";

import SkeletonCard from "../../../components/common/SkeletonCard";
import toast from "react-hot-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { exportToCSV, exportToPDF } from "../../../utils/profitExport";
import "../styles/sic-report.css";

const SICRawReport = () => {
  const [loading, setLoading] = useState(true);
  const [rawSIC, setRawSIC] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    createdBy: "",
    materialId: "",
  });

  const [auditMode, setAuditMode] = useState(false);
  const round100 = (num) => Math.round((num || 0) / 100) * 100;

  // Load SIC data
  const loadSIC = async () => {
    setLoading(true);
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );

     const res = await sicService.getRawSICReport(cleanFilters);

    if (res.data.success) {
      setRawSIC(res.data.report); 
    }
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
        const res = await materialService.getAllMaterials(); 
        if (res.data.ok) {
        setMaterials(res.data.items || []);
        }
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

  const filteredSIC = rawSIC.filter(r => 
    (r.material_name || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sic-container">
      <h2 className="page-title">Raw Materials SIC Report</h2>

      {/* Filters */}
      <div className="profit-filters">
        <div className="filter-group">
            <label>Pick Date:</label>
            <input 
                type="date" 
                value={filters.startDate}
                onChange={e => setFilters(f => ({ ...f, startDate: e.target.value, endDate: e.target.value }))} 
            />
        </div>
        
        <select
          onChange={e => setFilters(f => ({ ...f, materialId: e.target.value }))}
        >
          <option value="">All Materials</option>
          {materials.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>

        <input 
            type="text" 
            placeholder="Search material..."
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            value={search}
            onChange={e => setSearch(e.target.value)}
        />

        <button className="apply-btn" onClick={loadSIC}>Apply Filters</button>

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
          const headers = ["Material", "Unit", "Submitted By", "Opening", "Issues", "Waste", "Closing", "Actual Usage", "Expected Usage", "Variance", "Value"];
          const rows = filteredSIC.map(r => [
            r.material_name || `ID: ${r.material_id}`,
            r.measurement_unit,
            r.submitted_by,
            r.opening_qty,
            r.issues_qty,
            r.waste_qty,
            r.closing_qty,
            r.system_usage,
            r.expected_usage,
            r.variance,
            r.variance_value
          ]);
          exportToCSV(headers, rows, "raw_sic_report.csv");
        }}>CSV</button>
        
        <button onClick={() => {
          const headers = ["Material", "Unit", "Opening", "Issues", "Waste", "Closing", "Actual Usage", "Expected Usage", "Variance", "Value"];
          const rows = filteredSIC.map(r => [
            r.material_name || `ID: ${r.material_id}`,
            r.measurement_unit,
            r.opening_qty,
            r.issues_qty,
            r.waste_qty,
            r.closing_qty,
            r.system_usage,
            r.expected_usage,
            r.variance,
            r.variance_value
          ]);
          exportToPDF("Raw Materials SIC Report", headers, rows, "raw_sic_report.pdf");
        }}>PDF</button>
      </div>

      {/* Cards */}
      <div className="grid">
        {loading ? (
          <SkeletonCard height={150} />
        ) : (
          filteredSIC.map(r => {
            const variance = auditMode ? r.variance : Math.round(r.variance);
            const varianceValue = auditMode ? r.variance_value : round100(r.variance_value);

            return (
              <div key={r.id} className={`sic-report-card ${auditMode ? 'audit-border' : ''}`}>
                <h4>{r.material_name || `ID: ${r.material_id}`}</h4>
                <p>Submitted by: {r.submitted_by}</p>
                <p>Opening: {r.opening_qty} {r.measurement_unit}</p>
                <p>New Issues: {r.issues_qty} {r.measurement_unit}</p>
                <p>Waste: {r.waste_qty} {r.measurement_unit}</p>
                <p>Closing: {r.closing_qty} {r.measurement_unit}</p>
                <hr />
                <p>Actual Usage: <strong>{r.system_usage} {r.measurement_unit}</strong></p>
                <p>Expected Usage: <strong>{r.expected_usage} {r.measurement_unit}</strong></p>
                
                <strong className={r.variance >= 0 ? "profit" : "loss"}>
                  Variance: {variance} {r.measurement_unit} (₦{Number(varianceValue).toLocaleString(undefined, { maximumFractionDigits: auditMode ? 2 : 0 })})
                </strong>
                
                <div className={`remark-badge ${r.variance < 0 ? 'over' : (r.variance > 0 ? 'under' : 'good')}`}>
                    {r.variance < 0 ? 'Over usage / Missing' : (r.variance > 0 ? 'Under usage' : 'Good')}
                </div>

                {r.override_reason && <small>Override: {r.override_reason}</small>}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SICRawReport;

import React, { useState, useEffect } from 'react';
import { rawVariance } from '../../api/reports';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import '../../styles/pages/VarianceReport.css';

const VarianceReport = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [varianceData, setVarianceData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const round0 = (value) => {
  if (value === null || value === undefined) return '-';
  return Math.round(Number(value));
};

  const fetchVariance = async () => {
    if (!startDate || !endDate) return toast.error('Please select both start and end dates');

    setLoading(true);
    toast.loading('Fetching raw material variance...');

    try {
      const response = await rawVariance({ start_date: startDate, end_date: endDate });
      const items = response?.data?.items || [];
      setVarianceData(items);
      setFilteredData(items);
      toast.dismiss();
      toast.success('Raw material variance data loaded');
    } catch (err) {
      console.error('Fetch variance error:', err);
      toast.dismiss();
      toast.error('Failed to fetch variance');
      setVarianceData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter on search
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFilteredData(varianceData);
    } else {
      setFilteredData(
        varianceData.filter(item => item.material_name.toLowerCase().includes(q))
      );
    }
  }, [search, varianceData]);

  // Export functions (CSV, Excel, PDF) remain unchanged
  const exportCSV = () => { /* ... */ };
  const exportExcel = () => { /* ... */ };
  const exportPDF = () => { /* ... */ };

  return (
    <div className="variance-report-container">
      <h2>Raw Materials Variance Report</h2>

      <div className="controls" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px', flexDirection:
        "column"
       }}>
        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                <input
          type="text"
          placeholder="Search materials..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: '200px' }}
        />
        <button onClick={fetchVariance} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Variance'}
        </button>
        {varianceData.length > 0 && (
          <>
            <button onClick={exportCSV}>CSV</button>
            <button onClick={exportExcel}>Excel</button>
            <button onClick={exportPDF}>PDF</button>
          </>
        )}

      </div>

      <table>
        <thead>
          <tr>
            <th>Material</th>
            <th>Expected Usage</th>
            <th>Actual Usage</th>
            <th>Variance Qty</th>
            <th>Unit Cost</th>
            <th>Variance Value</th>
            <th>Remark</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            [...Array(5)].map((_, i) => (
              <tr key={i} className="skeleton-row">
                <td colSpan="7">
                  <div className="skeleton-line" />
                </td>
              </tr>
            ))
          ) : filteredData.length === 0 ? (
            <tr>
              <td colSpan="7" style={{ textAlign: 'center' }}>No data to display</td>
            </tr>
          ) : (
            filteredData.map(item => (
              <tr key={item.material_id}>
                <td>{item.material_name}</td>
               <td>{round0(item.expected_usage)}</td>
                <td>{round0(item.actual_usage)}</td>
                <td>{round0(item.variance_qty)}</td>
                <td>{round0(item.unit_cost)}</td>
                <td>{round0(item.variance_value)}</td>
                <td>{item.remark}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VarianceReport;

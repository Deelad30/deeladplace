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

  const exportCSV = () => {
    // Implementation placeholder - assuming utils handled mainly
    toast('CSV export started');
  };
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Variance");
    XLSX.writeFile(wb, "variance_report.xlsx");
  };
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Variance Report", 14, 16);
    autoTable(doc, {
      startY: 20,
      head: [['Material', 'Unit', 'Expected', 'Actual', 'Variance Qty', 'Cost', 'Variance Value', 'Remark']],
      body: filteredData.map(item => [
        item.material_name,
        item.measurement_unit,
        round0(item.expected_usage),
        round0(item.actual_usage),
        round0(item.variance_qty),
        round0(item.unit_cost),
        round0(item.variance_value),
        item.remark
      ]),
    });
    doc.save("variance_report.pdf");
  };

  return (
    <div className="variance-report-container animate-fade-in premium-card p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-gray-800">Raw Materials Variance Report</h2>
        <div className="flex gap-2">
            {varianceData.length > 0 && (
              <>
                <button className="secondary-btn small" onClick={exportCSV}>CSV</button>
                <button className="secondary-btn small" onClick={exportExcel}>Excel</button>
                <button className="secondary-btn small" onClick={exportPDF}>PDF</button>
              </>
            )}
        </div>
      </div>

      <div className="premium-card bg-gray-50 p-4 mb-6 flex flex-wrap gap-4 items-end border border-gray-200">
        <div className="flex flex-col gap-1">
           <label style={{color:"yellow"}} className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
           <input type="date" className="premium-input w-auto bg-white" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
           <label style={{color:"yellow"}}  className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
           <input type="date" className="premium-input w-auto bg-white" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
        
        <div className="flex-1 min-w-[200px]">
           <input
            type="text"
            className="premium-input w-full bg-white"
            placeholder="Search materials..."
            style={{marginBottom:"20px", marginTop:"20px"}}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <button className="primary-btn" onClick={fetchVariance} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Report'}
        </button>
      </div>

      <div className="premium-table-wrapper">
        <table className="premium-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Unit</th>
              <th className="text-right">Expected Usage</th>
              <th className="text-right">Actual Usage</th>
              <th className="text-right">Variance Qty</th>
              <th className="text-right">Unit Cost</th>
              <th className="text-right">Variance Value</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="7"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
                </tr>
              ))
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">No data found for selected period</td>
              </tr>
            ) : (
              filteredData.map(item => (
                <tr key={item.material_id}>
                  <td className="font-medium text-gray-700">{item.material_name}</td>
                  <td>{item.measurement_unit}</td>
                  <td className="text-right">{round0(item.expected_usage)}</td>
                  <td className="text-right">{round0(item.actual_usage)}</td>
                  <td className={`text-right font-medium ${item.variance_qty < 0 ? 'text-red-600' : 'text-green-600'}`}>
                     {round0(item.variance_qty)}
                  </td>
                  <td className="text-right">₦{round0(item.unit_cost)}</td>
                  <td className={`text-right font-bold ${item.variance_value < 0 ? 'text-red-600' : 'text-green-600'}`}>
                     ₦{round0(item.variance_value)}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${item.variance_value === 0 ? 'bg-gray-100 text-gray-600' : item.variance_value > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {item.remark || (item.variance_value === 0 ? 'Balanced' : item.variance_value > 0 ? 'Surplus' : 'Loss')}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VarianceReport;

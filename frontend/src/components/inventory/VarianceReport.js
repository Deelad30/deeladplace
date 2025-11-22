import React, { useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import '../../styles/pages/VarianceReport.css';

const VarianceReport = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [varianceData, setVarianceData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVariance = async () => {
    if (!selectedDate) return toast.error('Please select a date');

    setLoading(true);
    try {
      // Format the date to "YYYY-MM-DD"
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
      toast.loading('Fetching variance...');

      // Fetch today's movements
      const todayResponse = await inventoryService.getMovementsByDate(formattedDate);
      const todayMovements = todayResponse?.data?.data || [];

      // Fetch yesterday's movements
      const yesterday = new Date(formattedDate);
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedYesterday = yesterday.toISOString().split('T')[0];

      const yesterdayResponse = await inventoryService.getMovementsByDate(formattedYesterday);
      const yesterdayMovements = yesterdayResponse?.data?.data || [];

      // Combine data and calculate variance
      const combinedData = todayMovements.map(today => {
        const yesterdayRow = yesterdayMovements.find(
          y => y.raw_material_id === today.raw_material_id
        ) || {};
        return {
          ...today,
          usage_yesterday: parseFloat(yesterdayRow.usage || 0),
          variance: parseFloat(today.usage) - parseFloat(yesterdayRow.usage || 0),
        };
      });

      setVarianceData(combinedData);
      toast.dismiss();
      toast.success('Variance data loaded');
    } catch (err) {
      console.error('Fetch variance error:', err);
      toast.dismiss();
      toast.error('Failed to fetch variance');
      setVarianceData([]);
    } finally {
      setLoading(false);
    }
  };

  const getVarianceClass = (variance) => {
  if (variance > 0) return 'positive'; 
  if (variance < 0) return 'negative';  
  return 'neutral';                      
};

const downloadPDF = () => {
  if (!varianceData || varianceData.length === 0) {
    toast.error("No data to download!");
    return;
  }

  const doc = new jsPDF();

  const tableColumn = ["Material", "Opening Stock", "Closing Stock", "Usage", "Waste", "Variance"];
  const tableRows = varianceData.map(item => [
    item.raw_material_name,
    item.opening_stock,
    item.closing_stock,
    item.usage,
    item.waste,
    item.variance
  ]);

  autoTable(doc, { head: [tableColumn], body: tableRows });

  doc.save(`variance-report-${new Date().toISOString().slice(0,10)}.pdf`);
  toast.success("Variance report downloaded!");
};


  return (
    <div className="variance-report-container">
      <h2>Variance Report</h2>
      <div className="controls">
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
        <button onClick={fetchVariance} disabled={loading}>
          {loading ? 'Loading...' : 'Fetch Variance'}
        </button>
<button 
  className="download-btn" 
  onClick={downloadPDF} 
  disabled={varianceData.length === 0}
>
  Download PDF
</button>

      </div>

      <table>
        <thead>
          <tr>
            <th>Material</th>
            <th>Opening</th>
            <th>Issues</th>
            <th>Waste</th>
            <th>Closing</th>
            <th>Usage</th>
            <th>Yesterday Usage</th>
            <th>Variance</th>
          </tr>
        </thead>
        <tbody>
          {varianceData.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center' }}>
                No data to display
              </td>
            </tr>
          ) : (
            varianceData.map(item => (
              <tr key={item.id}>
                <td>{item.raw_material_name}</td>
                <td>{item.opening_stock}</td>
                <td>{item.issues}</td>
                <td>{item.waste}</td>
                <td>{item.closing_stock}</td>
                <td>{item.usage}</td>
                <td>{item.usage_yesterday}</td>
                <td className={getVarianceClass(item.variance)}>{item.variance}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VarianceReport;

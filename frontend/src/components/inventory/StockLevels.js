import React, { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';
import toast from 'react-hot-toast';
import '../../styles/pages/StockLevels.css';

const StockLevels = () => {
  const [allStock, setAllStock] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllStock();
  }, []);

  const fetchAllStock = async () => {
    setLoading(true);
    try {
      const response = await inventoryService.getAllStockLevels();
      setAllStock(response?.data?.data || []);
      toast.success('Stock levels loaded');
    } catch (err) {
      console.error('Get all stock levels error:', err);
      toast.error('Failed to load stock levels');
      setAllStock([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (closing, min) => {
    if (closing === null) return 'no-data'; // for materials with no movements yet
    if (closing <= min) return 'critical';
    if (closing <= min * 1.2) return 'warning';
    return 'ok';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="stock-levels-container">
      <h2>Stock Levels Dashboard</h2>
      <button className="refresh-btn" onClick={fetchAllStock} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh'}
      </button>
      <table>
        <thead>
          <tr>
            <th>Material</th>
            <th>Closing Stock</th>
            <th>Minimum Level</th>
            <th>Status</th>
            <th>Latest Movement</th>
          </tr>
        </thead>
        <tbody>
          {allStock.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center' }}>
                No stock data available.
              </td>
            </tr>
          ) : (
            allStock.map((item) => (
              <tr
                key={item.raw_material_id}
                className={getStatusClass(item.closing_stock, item.min_stock_level)}
              >
                <td>{item.name}</td>
                <td>{item.closing_stock ?? '-'}</td>
                <td>{item.min_stock_level}</td>
                <td>
                  {item.closing_stock === null
                    ? 'No Data'
                    : item.closing_stock <= item.min_stock_level
                    ? 'Low Stock'
                    : 'OK'}
                </td>
                <td>{formatDate(item.movement_date)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StockLevels;

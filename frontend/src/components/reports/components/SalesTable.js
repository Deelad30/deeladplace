// src/components/reports/components/SalesTable.js
import React, { useEffect, useState, useCallback } from 'react';
import { salesService } from '../../../services/salesService';
import { toast } from 'react-hot-toast';
import { openPrintWindow } from '../../../utils/printHelpers';
import { useAuth } from '../../../context/AuthContext';
import './SalesTable.css';

const SalesTable = ({ filters, vendors, auditMode = false }) => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [activeTab, setActiveTab] = useState('details');


const round100 = (num) => Math.round((num || 0) / 100) * 100;

const fetchPage = useCallback(async (p = 1) => { 
  setLoading(true);
  try {
    const params = {
      page: p,
      limit,
      start: filters.start,
      end: filters.end,
      vendor_id: filters.vendor_id,
      payment_type: filters.payment_type,
      user_id: filters.user_id
    };

    const res = await salesService.getSalesPaginated(params);
     console.log(res)

    // CHANGE HERE: use res.items
    if (res && res.ok && Array.isArray(res.items)) {
      setData(res.items);
      setTotalPages(res.total_pages || 1);
      setTotalRows(res.total_rows || res.items.length || 0);
    } else {
      setData([]);
      setTotalPages(1);
      setTotalRows(0);
      toast.error('No sales data available');
    }
  } catch (err) {
    setData([]);
    toast.error('Failed to load sales');
  } finally {
    setLoading(false);
  }
}, [filters, limit]);


useEffect(() => {
  setPage(1);
  fetchPage(1);
}, [fetchPage]);

useEffect(() => {
  fetchPage(page);
}, [fetchPage, page]);

  const openModal = (sale) => {
    setSelectedSale(sale);
    setActiveTab('details');
  };
  const closeModal = () => setSelectedSale(null);

  const handleReprint = async (sale) => {
    if (!sale || !sale.transaction_id) {
      toast.error('Transaction ID missing for this sale');
      return;
    }

    const t = toast.loading('Fetching transaction items...');
    try {
      const res = await salesService.getTransactionDetails(sale.transaction_id);
      if (res && res.ok && res.items) {
        // Aggregate items and calculate totals
        const items = res.items;
        const totalAmount = items.reduce((sum, item) => 
          sum + (Number(item.selling_price) + Number(item.custom_commission || 0)) * item.qty, 0
        );

        // Reconstruct the breakdown (can be fetched from any of the same items)
        let breakdown = [];
        try {
          const firstItem = items[0];
          if (typeof firstItem.payment_breakdown === 'string') {
            breakdown = JSON.parse(firstItem.payment_breakdown);
          } else if (Array.isArray(firstItem.payment_breakdown)) {
            breakdown = firstItem.payment_breakdown;
          }
        } catch (e) {
          console.error('Failed to parse breakdown', e);
        }

        const saleToPrint = {
          date: sale.created_at,
          transaction_id: sale.transaction_id,
          items: items,
          totalAmount: totalAmount,
          payment: {
            breakdown: breakdown
          }
        };

        openPrintWindow(saleToPrint, vendors, { tenantLogo: user?.tenant_logo });
        toast.success('Print window opened', { id: t });
      } else {
        toast.error('Could not find transaction items', { id: t });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to reprint receipt', { id: t });
    }
  };

  return (
    <>
      <div style={{ padding: 12 }}>
        <div style={{ color: 'var(--color-muted)', marginBottom: 8 }}>
          Showing {data.length} of {totalRows} records
        </div>

        <div className="table-body">
          <table className="sales-table">
            <thead>
              <tr>
                <th>Date/Time</th>
                <th>Product</th>
                <th>Sold by</th>
                <th>Vendor</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Unit Comm.</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <div className="skeleton" style={{ height: 120, borderRadius: 8 }}></div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: 28, color: 'var(--color-muted)' }}>
                    No sales found
                  </td>
                </tr>
              ) : data.map((row) => (
                <tr key={row.id || Math.random()} onClick={() => openModal(row)} className={auditMode ? 'audit-border-row' : ''} style={{ cursor: 'pointer' }}>
                  <td>{new Date(row.created_at).toLocaleString()}</td>
                  <td>{row.product_name || `#${row.product_id}`}</td>
                  <td>{row.sold_by || "-"}</td>
                  <td>{vendors.find(v => v.id === row.vendor_id)?.name || row.vendor_id}</td>
                  <td>{row.qty}</td>
                  <td>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: auditMode ? 2 : 0 }).format(Number(row.selling_price))}</td>
                  <td>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: auditMode ? 2 : 0 }).format(Number(row.commission) / Number(row.qty))}</td>
                  <td>{new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: auditMode ? 2 : 0 }).format((Number(row.selling_price) + (Number(row.commission) / Number(row.qty))) * Number(row.qty))}</td>
                  <td><span className="row-badge">{row.payment_method || 'unknown'}</span></td>
                  <td>
                    {row.transaction_id ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleReprint(row); }}
                        style={{ 
                          background: 'none', 
                          border: 'none', 
                          cursor: 'pointer', 
                          fontSize: '18px',
                          color: 'var(--color-primary)'
                        }}
                        title="Reprint Receipt"
                      >
                        🖨️
                      </button>
                    ) : (
                      <span style={{ color: 'var(--color-muted)' }}>-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="pagination" style={{ justifyContent: 'center' }}>
        <button className="page-btn" onClick={() => setPage(1)} disabled={page === 1}>First</button>
        <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
        <div className="page-info">Page {page} of {totalPages}</div>
        <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</button>
        <button className="page-btn" onClick={() => setPage(totalPages)} disabled={page === totalPages}>Last</button>
      </div>

      {/* Modal */}
      {selectedSale && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>
            <h2 style={{ marginBottom: '15px' }}>Sale Details</h2>

            <div className="modal-tabs">
              <button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>Details</button>
              <button className={activeTab === 'customer' ? 'active' : ''} onClick={() => setActiveTab('customer')}>Customer</button>
              <button className={activeTab === 'payment' ? 'active' : ''} onClick={() => setActiveTab('payment')}>Payment</button>
            </div>

            <div className="modal-tab-content">
              {activeTab === 'details' && (
                <>
                  <p><strong>Date:</strong> {new Date(selectedSale.created_at).toLocaleString()}</p>
                  <p><strong>Product:</strong> {selectedSale.product_name || `#${selectedSale.product_id}`}</p>
                  <p><strong>Vendor:</strong> {vendors.find(v => v.id === selectedSale.vendor_id)?.name || selectedSale.vendor_id}</p>
                  <p><strong>Quantity:</strong> {selectedSale.qty}</p>
                   <p><strong>Unit Commission:</strong> {new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: auditMode ? 2 : 0 }).format(Number(selectedSale.commission) / Number(selectedSale.qty))}</p>
                </>
              )}

              {activeTab === 'customer' && (
                <>
                  <p><strong>Customer Type:</strong> {selectedSale.order_method || 'Unknown'}</p>
                 <p><strong>Unit Price:</strong> {
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: auditMode ? 2 : 0 }).format(
    Number(selectedSale.selling_price)
  )
}</p>
                 <p><strong>Total:</strong> {
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: auditMode ? 2 : 0 }).format(
    (Number(selectedSale.selling_price) + (Number(selectedSale.commission) / Number(selectedSale.qty))) * Number(selectedSale.qty)
  )
}</p>

                </>
              )}

              {activeTab === 'payment' && (
                <>
                  <p><strong>Payment Type:</strong> {selectedSale.payment_method}</p>
                  {selectedSale.payment_method === 'multiple' && selectedSale.payment_breakdown && (
                    <ul>
                      {selectedSale.payment_breakdown.map((p, idx) => (
                        <li key={idx}>
                          {p.method}: {new Intl.NumberFormat('en-NG', { 
                            style: 'currency', 
                            currency: 'NGN', 
                            maximumFractionDigits: auditMode ? 2 : 0 
                          }).format(Number(auditMode ? p.amount : round100(p.amount)))}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SalesTable;

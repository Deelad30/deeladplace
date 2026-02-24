import React, { useState, useEffect } from 'react';
import { getActiveBills, voidBill } from '../../api/pos';
import ActiveBillsSkeleton from './ActiveBillsSkeleton';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { ROLE_MAP } from '../../utils/roles';

const ActiveBillsModal = ({ visible, onClose, onLoadBill, onPrintBill, onPrintKitchen, onRefresh, standalone = false }) => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (visible || standalone) {
      fetchBills();
    }
    // eslint-disable-next-line
  }, [visible, standalone]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await getActiveBills();
      setBills(res.data.bills);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch active bills');
    } finally {
      setLoading(false);
    }
  };

  const handleVoid = async (id) => {
    if (!window.confirm('Are you sure you want to void this bill?')) return;
    try {
      await voidBill(id);
      toast.success('Bill voided');
      fetchBills();
    } catch (err) {
      console.error(err);
      toast.error('Failed to void bill');
    }
  };

  const filteredBills = bills.filter(bill => {
    const search = searchTerm.trim();
    if (!search) return true;
    return (bill.bill_no || "").includes(search) || 
           (bill.creator_name || "").includes(search);
  });

  const content = (
    <div className="active-bills-container">
      <div className="modal-search-wrapper" style={{ marginBottom: '1.5rem' }}>
        <input 
          type="text" 
          placeholder="Search by Table/Bill No or Staff..." 
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--pos-border)', fontSize: '0.9rem' }}
        />
      </div>

      {loading ? (
        <ActiveBillsSkeleton count={5} />
      ) : (
        <div className="bills-list">
          {filteredBills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--pos-text-muted)' }}>
              <p style={{ fontWeight: 600, color: 'var(--pos-text-main)', marginBottom: '0.5rem' }}>
                {searchTerm ? 'No bills match your search' : 'No active bills'}
              </p>
              <span style={{ fontSize: '0.85rem' }}>
                {searchTerm ? 'Try a different search term.' : 'All orders have been settled.'}
              </span>
            </div>
          ) : (
            <table className="bills-table">
              <thead>
                <tr>
                  <th>Table / Bill No</th>
                  <th>Staff</th>
                  <th>Opened</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map(bill => (
                  <tr key={bill.id}>
                    <td style={{ fontWeight: 700, color: 'var(--pos-accent)' }}>{bill.bill_no}</td>
                    <td>{bill.creator_name}</td>
                    <td>{new Date(bill.created_at).toLocaleTimeString()}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(bill.total_amount)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                          className="process-sale-btn-premium" 
                          onClick={() => onLoadBill(bill.id)}
                          style={{ padding: '6px 16px', margin: 0, fontSize: '0.85rem', width: 'auto' }}
                        >
                          Load
                        </button>
                        <button 
                          className="print-btn-glass" 
                          onClick={() => onPrintKitchen(bill.id)}
                          title="Print Kitchen Copy"
                        >
                          Kitchen
                        </button>
                        <button 
                          className="print-btn-glass" 
                          onClick={() => onPrintBill(bill.id)}
                          title="Print Bill"
                        >
                          Bill
                        </button>
                        {['admin', 'manager'].includes(ROLE_MAP[user?.role_id]) && (
                          <button 
                            onClick={() => handleVoid(bill.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--pos-danger)', padding: '4px 8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                          >
                            Void
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );

  if (standalone) return content;

  return (
    <div className="sale-options-modal-overlay">
      <div className="sale-options-modal" style={{ maxWidth: '900px', width: '95%', background: 'white', borderRadius: '16px', border: '1px solid var(--pos-border)', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)' }}>
        <div className="modal-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--pos-border)' }}>
          <h3 style={{ margin: 0, fontWeight: 700 }}>Active Bills</h3>
          <button className="close-btn" onClick={onClose} style={{ color: 'var(--pos-text-muted)' }}>&times;</button>
        </div>
        <div className="modal-body" style={{ padding: '1.5rem' }}>
          {content}
        </div>
      </div>
    </div>
  );
};

export default ActiveBillsModal;

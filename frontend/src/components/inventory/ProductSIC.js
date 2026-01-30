import React, { useEffect, useState, useCallback } from 'react';
import { postProductSic, listProductSic } from '../../api/sic';
import { productService } from '../../services/productService';
import { vendorService } from '../../services/vendorService';
import toast from 'react-hot-toast';
import '../../styles/shared/PremiumShared.css';

export default function ProductSICPage() {
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const fetchVendors = useCallback(async () => {
    try {
      const res = await vendorService.getAllVendors();
      setVendors(res.data.vendors || []);
    } catch (err) {
      toast.error('Failed to fetch vendors');
    }
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setInitialLoading(true);
      const productRes = await productService.getAllProducts();
      const allProducts = productRes?.data?.products || productRes.products || [];

      const sicRes = await listProductSic();
      const sicData = sicRes.data?.sic || [];
      const todayMap = new Map(sicData.map(s => [s.product_id, s]));

      const newRows = allProducts.map(p => {
        const existing = todayMap.get(p.id);
        return {
          product_id: p.id,
          name: p.name,
          unit: p.unit || 'pcs',
          vendor_id: p.vendor_id,
          date: today,
          opening_qty: existing ? existing.opening_qty : 0,
          issues_qty: 0,
          waste_qty: 0,
          closing_qty: existing ? existing.closing_qty : 0,
          duplicate: !!existing,
          dirty: false
        };
      });

      setRows(newRows);
    } catch (err) {
      toast.error('Failed to load products.');
    } finally {
      setInitialLoading(false);
    }
  }, [today]);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    setFilteredRows(
      rows.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(q);
        const matchesVendor = selectedVendor ? r.vendor_id === Number(selectedVendor)  : true;
        return matchesSearch && matchesVendor;
      })
    );
  }, [search, selectedVendor, rows]);

  useEffect(() => {
    fetchVendors();
    loadProducts();
  }, [fetchVendors, loadProducts]);

  function handleChange(realIndexInRows, field, value) {
    const updated = [...rows];
    updated[realIndexInRows][field] = Number(value);
    updated[realIndexInRows].dirty = true;
    setRows(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const toSubmit = rows.filter(r => r.dirty);
    if (toSubmit.length === 0) {
      toast.error("No changes made to submit");
      return;
    }

    toast.loading('Submitting Product SIC...', { id: 'sic-submit' });
    setLoading(true);

    let successCount = 0;
    for (const row of toSubmit) {
      try {
        await postProductSic({
          product_id: row.product_id,
          date: row.date,
          opening_qty: row.opening_qty,
          issues_qty: row.issues_qty,
          waste_qty: row.waste_qty,
          closing_qty: row.closing_qty,
          override_reason: null
        });
        successCount++;
        row.dirty = false;
        row.duplicate = true; 
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to submit row';
        toast.error(`${row.name}: ${msg}`);
      }
    }

    toast.dismiss('sic-submit');
    setLoading(false);

    if (successCount > 0) {
      toast.success(`Successfully submitted ${successCount} entries.`);
      setRows([...rows]);
    }
  }

  return (
    <div className="premium-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: 'yellow' }}>Daily Product SIC</h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'white' }}>Record daily finished goods inventory</p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-bar"
                style={{ width: '250px' }}
            />
            <select
                value={selectedVendor}
                onChange={e => setSelectedVendor(e.target.value)}
                className="filter-select"
                style={{ width: '200px' }}
            >
                <option value="">All Vendors</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
            </select>
          </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="table-container" style={{ marginTop: '0', border: 'none', boxShadow: 'none' }}>
           <div className="premium-table-wrapper desktop-view" style={{ overflowX: 'auto', width: '100%', border: '1px solid #e2e8f0' }}>
            <table className="premium-table" style={{ minWidth: '600px', width: '100%' }}>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Unit</th>
                    <th style={{ minWidth: '100px' }}>Opening</th>
                    <th style={{ minWidth: '100px' }}>Produced</th>
                    <th style={{ minWidth: '100px' }}>Waste</th>
                    <th style={{ minWidth: '100px' }}>Closing</th>
                </tr>
            </thead>
            <tbody>
                {initialLoading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan="6" style={{ padding: '0' }}>
                        <div style={{ padding: '20px 24px', animation: 'pulse 1.5s infinite ease-in-out' }}>
                            <div style={{ height: '20px', background: '#f1f5f9', borderRadius: '4px', width: '80%', marginBottom: '8px' }}></div>
                            <div style={{ height: '14px', background: '#f1f5f9', borderRadius: '4px', width: '40%' }}></div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredRows.length === 0 ? (
                <tr><td colSpan="6" className="empty-state">No products found</td></tr>
                ) : (
                filteredRows.map((r) => {
                    const realIndex = rows.findIndex(at => at.product_id === r.product_id);
                    return (
                    <tr key={r.product_id} style={{ background: 'transparent' }}>
                        <td style={{ fontWeight: '600' }}>{r.name}</td>
                        <td style={{ color: '#64748b', fontSize: '13px' }}>{r.unit}</td>
                        <td>
                            <input 
                                type="number" min="0" 
                                className="premium-input" 
                                style={{ padding: '8px', fontSize: '13px' }}
                                value={r.opening_qty} onChange={e => handleChange(realIndex, 'opening_qty', e.target.value)} 
                            />
                        </td>
                        <td>
                            <input 
                                type="number" min="0" 
                                className="premium-input" 
                                style={{ padding: '8px', fontSize: '13px' }}
                                value={r.issues_qty} onChange={e => handleChange(realIndex, 'issues_qty', e.target.value)} 
                            />
                        </td>
                        <td>
                            <input 
                                type="number" min="0" 
                                className="premium-input" 
                                style={{ padding: '8px', fontSize: '13px' }}
                                value={r.waste_qty} onChange={e => handleChange(realIndex, 'waste_qty', e.target.value)} 
                            />
                        </td>
                        <td>
                            <input 
                                type="number" min="0" 
                                className="premium-input" 
                                style={{ padding: '8px', fontSize: '13px' }}
                                value={r.closing_qty} onChange={e => handleChange(realIndex, 'closing_qty', e.target.value)} 
                            />
                        </td>
                    </tr>
                    );
                })
                )}
            </tbody>
            </table>
           </div>

           {/* Mobile View (Cards) */}
           <div className="mobile-view-cards">
             {initialLoading ? (
                  [...Array(3)].map((_, i) => (
                    <div key={i} className="premium-card" style={{padding:'16px', height:'200px', animation:'pulse 1.5s infinite'}}></div>
                  ))
             ) : filteredRows.length === 0 ? (
                <div className="empty-state" style={{textAlign:'center', padding:'20px'}}>No products found</div>
             ) : (
                filteredRows.map((r) => {
                    const realIndex = rows.findIndex(at => at.product_id === r.product_id);
                    return (
                        <div key={r.product_id} className="premium-card" style={{padding:'16px', border: '1px solid #e2e8f0', marginBottom:'12px'}}>
                            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                                <div>
                                    <h4 style={{margin:0, fontWeight:'700', color:'#1e293b'}}>{r.name}</h4>
                                    <span style={{fontSize:'12px', color:'#64748b'}}>Unit: {r.unit}</span>
                                </div>
                            </div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px'}}>
                                <div>
                                    <label style={{fontSize:'12px', color:'#64748b'}}>Opening</label>
                                    <input 
                                        type="number" min="0" className="premium-input" 
                                        style={{padding:'8px', width:'100%'}}
                                        value={r.opening_qty} onChange={e => handleChange(realIndex, 'opening_qty', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label style={{fontSize:'12px', color:'#64748b'}}>Closing</label>
                                    <input 
                                        type="number" min="0" className="premium-input" 
                                        style={{padding:'8px', width:'100%'}}
                                        value={r.closing_qty} onChange={e => handleChange(realIndex, 'closing_qty', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label style={{fontSize:'12px', color:'#64748b'}}>Produced</label>
                                    <input 
                                        type="number" min="0" className="premium-input" 
                                        style={{padding:'8px', width:'100%'}}
                                        value={r.issues_qty} onChange={e => handleChange(realIndex, 'issues_qty', e.target.value)} 
                                    />
                                </div>
                                <div>
                                    <label style={{fontSize:'12px', color:'#64748b'}}>Waste</label>
                                    <input 
                                        type="number" min="0" className="premium-input" 
                                        style={{padding:'8px', width:'100%'}}
                                        value={r.waste_qty} onChange={e => handleChange(realIndex, 'waste_qty', e.target.value)} 
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })
             )}
           </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
             <button type="submit" disabled={loading} className="submit-btn" style={{ width: 'auto', minWidth: '200px' }}>
                {loading ? 'Submitting...' : 'Submit Records'}
            </button>
        </div>
      </form>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { postProductSic, listProductSic } from '../../api/sic';
import { productService } from '../../services/productService';
import { vendorService } from '../../services/vendorService';
import toast from 'react-hot-toast';
import '../../styles/pages/SICSForm.css';

export default function ProductSICPage() {
  const [products, setProducts] = useState([]);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vendors, setVendors] = useState([]);
  const { setVendors: setAppVendors } = useApp();

    const fetchVendors = useCallback(async () => {
    try {
      const res = await vendorService.getAllVendors();
      setVendors(res.data.vendors);
      
      setAppVendors(res.data.vendors);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch vendors');
    }
  }, [setAppVendors]);

  console.log(vendors);
  

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadProducts();
    fetchVendors();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFilteredRows(rows);
    } else {
      setFilteredRows(rows.filter(r => r.name.toLowerCase().includes(q)));
    }
  }, [search, rows]);

  async function loadProducts() {
    try {
      setInitialLoading(true);

      const productRes = await productService.getAllProducts();
      const allProducts = productRes?.data?.products || productRes.products || [];
      setProducts(allProducts);

      const sicRes = await listProductSic();
      const sicData = sicRes.data?.sic || [];
      const todayMap = new Map(sicData.map(s => [s.product_id, s]));

      const newRows = allProducts.map(p => {
        const existing = todayMap.get(p.id);
        return {
          product_id: p.id,
          name: p.name,
          unit: p.unit || 'pcs',
          date: today,
          opening_qty: existing ? existing.opening_qty : 0,
          issues_qty: 0,
          waste_qty: 0,
          closing_qty: existing ? existing.closing_qty : 0,
          duplicate: !!existing
        };
      });

      setRows(newRows);
      setFilteredRows(newRows);
    } catch (err) {
      toast.error('Failed to load products.');
      console.error(err);
    } finally {
      setInitialLoading(false);
    }
  }

  function handleChange(index, field, value) {
    const updated = [...filteredRows];
    updated[index][field] = Number(value);
    setFilteredRows(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    toast.loading('Submitting Product SIC...', { id: 'sic-submit' });
    setLoading(true);

    let successCount = 0;

    for (const row of filteredRows) {
      if (row.duplicate) {
        toast.error(`${row.name}: SIC already submitted today`);
        continue;
      }

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
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to submit row';
        toast.error(`${row.name}: ${msg}`);
      }
    }

    toast.dismiss('sic-submit');

    if (successCount > 0) {
      toast.success(`Submitted ${successCount} Product SIC entries.`);
      await loadProducts();
    }

    setLoading(false);
  }

  return (
    <div className="sics-form-container">
      <h2>Daily Product SIC</h2>

      {/* Search bar */}
      <input
        type="text"
        placeholder="Search products (partial, case-insensitive)"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="sic-search"
      />

      <form className="sics-form" onSubmit={handleSubmit}>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Unit</th>
              <th>Opening</th>
              <th>Produced</th>
              <th>Waste</th>
              <th>Closing</th>
            </tr>
          </thead>
          <tbody>
            {initialLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i} className="skeleton-row">
                  <td colSpan="6">
                    <div className="skeleton-line" />
                  </td>
                </tr>
              ))
            ) : filteredRows.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', opacity: 0.6 }}>
                  No products found
                </td>
              </tr>
            ) : (
              filteredRows.map((r, index) => (
                <tr key={r.product_id}>
                  <td>{r.name}</td>
                  <td>{r.unit}</td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      value={r.opening_qty}
                      disabled={r.duplicate}
                      onChange={e => handleChange(index, 'opening_qty', e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      value={r.issues_qty}
                      onChange={e => handleChange(index, 'issues_qty', e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      value={r.waste_qty}
                      onChange={e => handleChange(index, 'waste_qty', e.target.value)}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      value={r.closing_qty}
                      onChange={e => handleChange(index, 'closing_qty', e.target.value)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Product SIC'}
        </button>
      </form>
    </div>
  );
}

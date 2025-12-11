import React, { useEffect, useState } from 'react';
import { postProductSic, listProductSic } from '../../api/sic';
import { productService } from '../../services/productService';
import toast from 'react-hot-toast';
import '../../styles/pages/SICSForm.css';

export default function ProductSICPage() {
  const [products, setProducts] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line
  }, []);

  async function loadProducts() {
    try {
      // 1️⃣ Fetch all products
      const productRes = await productService.getAllProducts();
      const allProducts = productRes?.data?.products || productRes.products || [];
      console.log(allProducts);
      

      setProducts(allProducts);
      // 2️⃣ Fetch today's SIC entries to prevent duplicates
      const sicRes = await listProductSic();
      const sicData = sicRes.data?.sic || [];
      const todayMap = new Map(sicData.map(s => [s.product_id, s]));

      // 3️⃣ Build rows for the form
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
          duplicate: !!existing,
        };
      });

      setRows(newRows);
    } catch (err) {
      toast.error('Failed to load products.');
      console.error(err);
    }
  }

  function handleChange(index, field, value) {
    const updated = [...rows];
    updated[index][field] = Number(value);
    setRows(updated);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    let successCount = 0;

    for (const row of rows) {
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
        console.error(err);
      }
    }

    if (successCount > 0) {
      toast.success(`Submitted ${successCount} Product SIC entries.`);
      await loadProducts(); // Refresh rows
    }

    setLoading(false);
  }

  return (
    <div className="sics-form-container">
      <h2>Daily Product SIC</h2>

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
            {rows.map((r, index) => (
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
            ))}
          </tbody>
        </table>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Product SIC'}
        </button>
      </form>
    </div>
  );
}

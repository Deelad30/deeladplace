import React, { useEffect, useState } from 'react';
import { postRawSic, listRawSic } from '../../api/sic';
import { rawMaterialsService } from '../../services/rawMaterialsService';
import toast from 'react-hot-toast';
import '../../styles/pages/SICSForm.css';

export default function RawSICPage() {
  const [materials, setMaterials] = useState([]);
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [search, setSearch] = useState('');

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadMaterials();
    // eslint-disable-next-line
  }, []);

useEffect(() => {
  const q = search.trim();

  if (!q) {
    setFilteredRows(rows);
  } else {
    setFilteredRows(
      rows.filter(r =>
        r.name.toLowerCase().includes(q.toLowerCase())
      )
    );
  }
}, [search, rows]);


  async function loadMaterials() {
    try {
      setInitialLoading(true);

      const data = await rawMaterialsService.getAll();
      setMaterials(data.materials);

      const todaySIC = await listRawSic();
      const todayMap = new Map(
        todaySIC.data.sic?.map(s => [s.material_id, s]) || []
      );

      const preparedRows = data.materials.map(m => {
        const existing = todayMap.get(m.id);
        return {
          material_id: m.id,
          name: m.name,
          unit: m.measurement_unit,
          date: today,
          opening_qty: existing ? existing.opening_qty : 0,
          issues_qty: 0,
          waste_qty: 0,
          closing_qty: existing ? existing.closing_qty : 0,
          duplicate: !!existing
        };
      });

      setRows(preparedRows);
      setFilteredRows(preparedRows);

    } catch (err) {
      toast.error('Failed to load raw materials.');
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

    toast.loading('Submitting Raw SIC...', { id: 'sic-submit' });
    setLoading(true);

    let successCount = 0;

    for (const row of filteredRows) {
      if (row.duplicate) {
        toast.error(`${row.name}: SIC already submitted today`);
        continue;
      }

      try {
        await postRawSic({
          material_id: row.material_id,
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
      toast.success(`Submitted ${successCount} SIC entries.`);
      loadMaterials();
    }

    setLoading(false);
  }

  return (
    <div className="sics-form-container">
      <h2>Daily Raw Material SIC</h2>

      {/* 🔍 Case-Sensitive Exact Search */}
      <input
        type="text"
        placeholder="Search material (case-sensitive, exact)"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="sic-search"
      />

      <form className="sics-form" onSubmit={handleSubmit}>
        <table>
          <thead>
            <tr>
              <th>Material</th>
              <th>Unit</th>
              <th>Opening</th>
              <th>Issues</th>
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
            ) : (
              filteredRows.map((r, index) => (
                <tr key={r.material_id}>
                  <td>{r.name}</td>
                  <td>{r.unit}</td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      value={r.opening_qty}
                      disabled={r.duplicate}
                      onChange={(e) =>
                        handleChange(index, 'opening_qty', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      value={r.issues_qty}
                      onChange={(e) =>
                        handleChange(index, 'issues_qty', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      value={r.waste_qty}
                      onChange={(e) =>
                        handleChange(index, 'waste_qty', e.target.value)
                      }
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      min="0"
                      value={r.closing_qty}
                      onChange={(e) =>
                        handleChange(index, 'closing_qty', e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Raw SIC'}
        </button>
      </form>
    </div>
  );
}

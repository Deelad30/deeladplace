import React, { useState, useEffect, useCallback } from "react";
import { productVariance } from "../../api/reports";
import toast from "react-hot-toast";
import { vendorService } from '../../services/vendorService';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ProductVarianceReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
const round = (num, nearest = 1) => Math.round(num / nearest) * nearest;
 const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [search, setSearch] = useState('');
const [filteredItems, setFilteredItems] = useState([]);

const round0 = (value) => {
  if (value === null || value === undefined) return '-';
  return Math.round(Number(value));
};
  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    try {
      const res = await vendorService.getAllVendors();
      setVendors(res.data.vendors || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch vendors');
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
  const q = search.trim().toLowerCase();

  setFilteredItems(
    items.filter(i => {
      const matchesSearch = i.product_name.toLowerCase().includes(q);
      console.log(i);
      
      const matchesVendor = selectedVendor
        ? String(i.vendor_id) === String(selectedVendor)
        : true;

      return matchesSearch && matchesVendor;
    })
  );
}, [items, search, selectedVendor]);


  const fetchVariance = async () => {
    if (!startDate || !endDate)
      return toast.error("Select both start and end dates");

    setLoading(true);
    try {
      const res = await productVariance({
        start_date: startDate,
        end_date: endDate,
        vendor_id: selectedVendor
      });

      setItems(res.items || []);
      toast.success("Product variance loaded");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load product variance");
    } finally {
      setLoading(false);
    }
  };

  /** UI color helper */
  const remarkClass = (remark) => {
    if (!remark) return "";
    if (remark === "Missing sales") return "neg";
    if (remark === "Overring") return "pos";
    if (remark === "Good") return "neutral";
    return "";
  };

  /** CSV Export */
  const exportCSV = () => {
    if (items.length === 0) return toast.error("No data");

    const rows = items.map((i) => ({
      Product: i.product_name,
      Expected_Qty: i.expected_sales_qty,
      Actual_Qty: i.actual_sales_qty,
      Variance_Qty: i.variance_qty,
      Selling_Price: i.selling_price,
      Expected_Revenue: i.expected_revenue,
      Actual_Revenue: i.actual_revenue,
      Revenue_Variance: i.revenue_variance,
      Profit_Variance: i.profit_variance,
      Remark: i.remark
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProductVariance");

    XLSX.writeFile(workbook, "product_variance.csv");
  };

  /** XLSX Export */
  const exportExcel = () => {
    if (items.length === 0) return toast.error("No data");

    const rows = items.map((i) => ({
      Product: i.product_name,
      Expected_Qty: i.expected_sales_qty,
      Actual_Qty: i.actual_sales_qty,
      Variance_Qty: i.variance_qty,
      Selling_Price: i.selling_price,
      Expected_Revenue: i.expected_revenue,
      Actual_Revenue: i.actual_revenue,
      Revenue_Variance: i.revenue_variance,
      Profit_Variance: i.profit_variance,
      Remark: i.remark
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ProductVariance");

    XLSX.writeFile(workbook, "product_variance.xlsx");
  };

  /** PDF Export */
  const exportPDF = () => {
    if (items.length === 0) return toast.error("No data");

    const doc = new jsPDF();

    autoTable(doc, {
      head: [
        [
          "Product",
          "Expected Qty",
          "Actual Qty",
          "Variance Qty",
          "Expected Revenue",
          "Actual Revenue",
          "Revenue Variance",
          "Profit Variance",
          "Remark"
        ]
      ],
      body: items.map((i) => [
        i.product_name,
        i.expected_sales_qty,
        i.actual_sales_qty,
        i.variance_qty,
        round(i.expected_revenue),
        round(i.actual_revenue),
        round(i.revenue_variance),
        round(i.profit_variance),
        i.remark
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
    });

    doc.save("product_variance.pdf");
  };

  return (
    <div className="variance-report-container animate-fade-in premium-card p-6">
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <h2 className="text-xl font-bold text-gray-800">Product Variance Report</h2>
        <div className="flex gap-2">
            {filteredItems.length > 0 && (
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
           <label style={{color:"yellow"}}  className="text-xs font-semibold text-gray-500 uppercase">Start Date</label>
           <input type="date" className="premium-input w-auto bg-white" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
           <label style={{color:"yellow"}}  className="text-xs font-semibold text-gray-500 uppercase">End Date</label>
           <input type="date" className="premium-input w-auto bg-white" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>

        <div className="flex flex-col gap-1 min-w-[150px]">
           <label style={{color:"yellow"}}  className="text-xs font-semibold text-gray-500 uppercase">Vendor</label>
           <select
                className="premium-input w-full bg-white"
                value={selectedVendor}
                onChange={e => setSelectedVendor(e.target.value)}
            >
                <option value="">All Vendors</option>
                {vendors.map(v => (
                <option key={v.id} value={v.id}>
                    {v.name}
                </option>
                ))}
            </select>
        </div>
        
        <div className="flex-1 min-w-[200px]">
           <label style={{color:"yellow"}}  className="text-xs font-semibold text-gray-500 uppercase">Search</label>
           <input
            type="text"
            className="premium-input w-full bg-white"
            placeholder="Search products..."
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
              <th>Product</th>
              <th className="text-right">Expected Qty</th>
              <th className="text-right">Actual Qty</th>
              <th className="text-right">Variance Qty</th>
              <th className="text-right">Exp Revenue</th>
              <th className="text-right">Act Revenue</th>
              <th className="text-right">Rev Variance</th>
              <th className="text-right">Profit Var</th>
              <th>Remark</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan="9"><div className="h-4 bg-gray-200 rounded w-full"></div></td>
                </tr>
              ))
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-8 text-gray-500">No data found</td>
              </tr>
            ) : (
              filteredItems.map(i => (
                <tr key={i.product_id}>
                  <td className="font-medium text-gray-700">{i.product_name}</td>
                  <td className="text-right">{round0(i.expected_sales_qty)}</td>
                  <td className="text-right">{round0(i.actual_sales_qty)}</td>
                  <td className={`text-right font-medium ${i.variance_qty < 0 ? 'text-red-600' : 'text-green-600'}`}>
                     {round0(i.variance_qty)}
                  </td>
                  <td className="text-right">{round(i.expected_revenue)}</td>
                  <td className="text-right">{round(i.actual_revenue)}</td>
                  <td className={`text-right font-bold ${i.revenue_variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                     {round(i.revenue_variance)}
                  </td>
                  <td className={`text-right font-bold ${i.profit_variance < 0 ? 'text-red-600' : 'text-green-600'}`}>
                     {round(i.profit_variance)}
                  </td>
                  <td>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        !i.remark ? 'bg-gray-100 text-gray-600' :
                        i.remark === 'Missing sales' ? 'bg-red-100 text-red-700' :
                        i.remark === 'Overring' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                    }`}>
                      {i.remark || '-'}
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

export default ProductVarianceReport;

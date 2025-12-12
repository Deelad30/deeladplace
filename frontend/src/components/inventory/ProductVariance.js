import React, { useState } from "react";
import { productVariance } from "../../api/reports";
import toast from "react-hot-toast";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

const ProductVarianceReport = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
const round = (num, nearest = 100) => Math.round(num / nearest) * nearest;

  const fetchVariance = async () => {
    if (!startDate || !endDate)
      return toast.error("Select both start and end dates");

    setLoading(true);
    try {
      const res = await productVariance({
        start_date: startDate,
        end_date: endDate
      });

      setItems(res.data.items || []);
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
    <div className="variance-report-container">
      <h2>Product Variance Report</h2>

      {/* Filters */}
      <div className="controls">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />

        <button onClick={fetchVariance} disabled={loading}>
          {loading ? "Loading..." : "Fetch Variance"}
        </button>

        {items.length > 0 && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={exportCSV}>CSV</button>
            <button onClick={exportExcel}>Excel</button>
            <button onClick={exportPDF}>PDF</button>
          </div>
        )}
      </div>

      {/* Table */}
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Expected Qty</th>
            <th>Actual Qty</th>
            <th>Variance Qty</th>
            <th>Expected Revenue</th>
            <th>Actual Revenue</th>
            <th>Revenue Variance</th>
            <th>Profit Variance</th>
            <th>Remark</th>
          </tr>
        </thead>

        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: "center" }}>
                No data
              </td>
            </tr>
          ) : (
            items.map((i) => (
              <tr key={i.product_id}>
                <td>{i.product_name}</td>
                <td>{i.expected_sales_qty}</td>
                <td>{i.actual_sales_qty}</td>
                <td>{i.variance_qty}</td>
                <td>{round(i.expected_revenue)}</td>
                <td>{round(i.actual_revenue)}</td>
                <td>{round(i.revenue_variance)}</td>
                <td>{round(i.profit_variance)}</td>
                <td className={remarkClass(i.remark)}>{i.remark}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductVarianceReport;

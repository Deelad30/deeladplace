import jsPDF from "jspdf";
import "jspdf-autotable";

export const exportToCSV = (data) => {
  const headers = ["Product", "Sales", "Cost", "Profit", "Margin %"];
  const rows = data.map(p => [
    p.product_name,
    p.total_sales,
    p.total_cost,
    p.gross_profit,
    p.profit_margin,
  ]);

  const csv = [headers, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "profit-report.csv";
  a.click();
};

export const exportToPDF = (products, netProfit) => {
  const doc = new jsPDF();
  doc.text("Profit Report", 14, 15);

  doc.text(`Net Profit: ₦${Number(netProfit.net_profit).toLocaleString()}`, 14, 25);

  doc.autoTable({
    startY: 35,
    head: [["Product", "Sales", "Cost", "Profit", "Margin %"]],
    body: products.map(p => [
      p.product_name,
      p.total_sales,
      p.total_cost,
      p.gross_profit,
      `${p.profit_margin}%`,
    ]),
  });

  doc.save("profit-report.pdf");
};

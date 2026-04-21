import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * Generic CSV Exporter
 * @param {string[]} headers 
 * @param {any[][]} rows 
 * @param {string} filename 
 */
export const exportToCSV = (headers, rows, filename = "report.csv") => {
  if (!headers || !rows) return;
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(cell => `"${cell || 0}"`).join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

/**
 * Generic PDF Exporter
 * @param {string} title 
 * @param {string[]} headers 
 * @param {any[][]} rows 
 * @param {string} filename 
 * @param {string} summaryText - Optional summary text (e.g. Net Profit)
 */
export const exportToPDF = (title, headers, rows, filename = "report.pdf", summaryText = "") => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 20);

  // Summary Text
  if (summaryText) {
    doc.setFontSize(11);
    doc.text(summaryText, 14, 30);
  }

  doc.autoTable({
    startY: summaryText ? 35 : 25,
    head: [headers],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [77, 112, 255] },
  });

  doc.save(filename);
};


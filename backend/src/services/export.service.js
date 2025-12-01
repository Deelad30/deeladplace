const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");

exports.exportCSV = (res, filename, rows) => {
  let csv = "";

  if (rows.length > 0) {
    csv += Object.keys(rows[0]).join(",") + "\n";
    rows.forEach((row) => {
      csv += Object.values(row).join(",") + "\n";
    });
  }

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}.csv`);
  res.send(csv);
};

exports.exportExcel = async (res, filename, rows) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");

  sheet.columns = Object.keys(rows[0]).map((k) => ({ header: k, key: k }));

  rows.forEach((row) => sheet.addRow(row));

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${filename}.xlsx`
  );

  await workbook.xlsx.write(res);
  res.end();
};

exports.exportPDF = (res, filename, rows) => {
  const doc = new PDFDocument();
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${filename}.pdf`
  );

  doc.pipe(res);
  doc.fontSize(16).text(filename.toUpperCase(), { align: "center" });
  doc.moveDown();

  rows.forEach((row) => {
    doc.fontSize(10).text(JSON.stringify(row));
    doc.moveDown();
  });

  doc.end();
};

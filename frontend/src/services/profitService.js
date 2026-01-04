import api from "./api"; // your axios instance

export const profitService = {
  getProductProfitability: (params) =>
    api.get("/report/product-profitability", { params }),

  getNetProfit: (params) =>
    api.get("/report/net-profit", { params }),
};

// SIC Reports
export const sicService = {
  getProductSICReport: (params) =>
    api.get("/report/product-sic", { params }),

  getRawSICReport: (params) =>
    api.get("/report/raw-sic", { params }),
};
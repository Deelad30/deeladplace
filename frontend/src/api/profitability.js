import api from "./api"; // your axios instance

export const getProductProfitability = (params) =>
  api.get("/reports/product-profitability", { params });

export const getNetProfit = (params) =>
  api.get("/reports/net-profit", { params });

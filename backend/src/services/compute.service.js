// src/services/compute.service.js
const db = require('../config/database');
const SQL = require('../utils/sql');


// ---------- MATERIAL COSTING ----------
async function getMaterialUnitCost(materialId, tenantId) {
  const res = await db.query(SQL.GET_LATEST_PURCHASE, [materialId, tenantId]);
  if (res.rows.length === 0) return 0;

  const { purchase_price, purchase_qty } = res.rows[0];
  if (!purchase_qty || purchase_qty <= 0) return 0;

  return Number(purchase_price) / Number(purchase_qty);
}

// ---------- RECIPE COST ----------
async function computeRecipeCost(productId, tenantId) {
  const result = await db.query(SQL.GET_RECIPE_MATERIALS, [productId, tenantId]);
  const items = result.rows;

  if (items.length === 0) {
    return { recipeCost: 0, batchQty: 1, components: [] };
  }

  let totalRecipeCost = 0;
  let batchQty = items[0].batch_qty || 1;
  let components = [];

  for (const item of items) {
    const unitCost = await getMaterialUnitCost(item.material_id, tenantId);
    const itemCost = unitCost * Number(item.recipe_qty);

    totalRecipeCost += itemCost;

    components.push({
      material_id: item.material_id,
      material_name: item.material_name,
      recipe_qty: Number(item.recipe_qty),
      unit_cost: unitCost,
      item_cost: itemCost
    });
  }

  const recipeCostPerUnit = totalRecipeCost / batchQty;

  return { recipeCostPerUnit, batchQty, components };
}

// ---------- PACKAGING ----------
async function computePackagingCost(productId, tenantId) {
  const res = await db.query(SQL.GET_PACKAGING_FOR_PRODUCT, [productId, tenantId]);
  if (res.rows.length === 0) return 0;

  let total = 0;

  for (const row of res.rows) {
    total += Number(row.cost_per_unit) * Number(row.qty);
  }

  return total;
}

// ---------- LABOUR ----------
async function computeLabourCost(tenantId, batchQty) {
  const res = await db.query(SQL.GET_LABOUR, [tenantId]);
  if (res.rows.length === 0) return 0;

  const totalLabour = res.rows.reduce((t, x) => t + Number(x.amount), 0);

  return totalLabour / batchQty;
}

// ---------- OPEX ----------
async function computeOpex(tenantId, COGS, batchQty) {
  const res = await db.query(SQL.GET_OPEX, [tenantId]);
  if (res.rows.length === 0) return 0;

  const today = new Date();

  let fixed = 0;
  let percent = 0;

  for (const opex of res.rows) {

    // Valid date-range filter
    const from = opex.effective_from ? new Date(opex.effective_from) : null;
    const to = opex.effective_to ? new Date(opex.effective_to) : null;

    const active =
      (!from || today >= from) &&
      (!to || today <= to);

    if (!active) continue; // skip inactive opex

    if (opex.allocation_mode === 'fixed') {
      fixed += Number(opex.amount);
    }

    if (opex.allocation_mode === 'percent_of_cogs') {
      percent += (Number(opex.percentage_value) / 100) * COGS;
    }
  }

  return (fixed + percent) / batchQty;
}

// ---------- MAIN COST ENGINE ----------
async function computeProductCost(productId, tenantId, options = {}) {
  // 1) Recipe Cost
  const { recipeCostPerUnit, batchQty, components } = await computeRecipeCost(productId, tenantId);

  // 2) Packaging
  const packagingCost = await computePackagingCost(productId, tenantId);

  // 3) Labour
  const labourCost = await computeLabourCost(tenantId, batchQty);

  // 4) COGS before OPEX
  const COGS = recipeCostPerUnit + packagingCost + labourCost;

  // 5) OPEX
  const opexCost = await computeOpex(tenantId, COGS, batchQty);

  // 6) Total Cost Price
  const tcop = COGS + opexCost;

  let sellingPrice = null;
  let marginPercent = null;

  if (options.marginPercent) {
    sellingPrice = tcop / (1 - options.marginPercent);
    marginPercent = options.marginPercent;
  } else if (options.sellingPrice) {
    sellingPrice = Number(options.sellingPrice);
    marginPercent = (sellingPrice - tcop) / sellingPrice;
  }

  return {
    recipe_components: components,
    recipe_cost: recipeCostPerUnit,
    packaging_cost: packagingCost,
    labour_cost: labourCost,
    opex_cost: opexCost,
    COGS,
    TCOP: tcop,
    selling_price: sellingPrice,
    margin_percent: marginPercent
  };
}

module.exports = { computeProductCost };

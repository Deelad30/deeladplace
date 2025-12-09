// src/services/compute.service.js
const db = require('../config/database');
const SQL = require('../utils/sql');

// ---------- MATERIAL UNIT COST ----------
async function getMaterialUnitCost(materialId, tenantId) {
  const res = await db.query(SQL.GET_LATEST_PURCHASE, [materialId, tenantId]);
  if (!res.rows.length) return 0;

  const { purchase_price, purchase_qty } = res.rows[0];
  if (!purchase_qty || purchase_qty <= 0) return 0;

  return Number(purchase_price) / Number(purchase_qty);
}

// ---------- RECIPE COST (total for batch, + components) ----------
async function computeRecipeCost(productId, tenantId) {
  const res = await db.query(SQL.GET_RECIPE_MATERIALS, [productId, tenantId]);
  const items = res.rows || [];

  if (!items.length) return { totalRecipeCost: 0, components: [] };

  let totalRecipeCost = 0;
  const components = [];

  for (const item of items) {
    const unitCost = await getMaterialUnitCost(item.material_id, tenantId);
    const itemCostForBatch = unitCost * Number(item.recipe_qty);
    totalRecipeCost += itemCostForBatch;

    components.push({
      material_id: item.material_id,
      material_name: item.material_name,
      recipe_qty: Number(item.recipe_qty),
      unit_cost: unitCost,
      item_cost_for_batch: itemCostForBatch
    });
  }

  return { totalRecipeCost, components };
}

// ---------- PACKAGING COST (total for batch) ----------
async function computePackagingCost(productId, tenantId) {
  const res = await db.query(SQL.GET_PACKAGING_FOR_PRODUCT, [productId, tenantId]);
  const rows = res.rows || [];
  if (!rows.length) return 0;

  let total = 0;
  for (const r of rows) {
    const qty = Number(r.qty) || 0;
    const cost = Number(r.cost_per_unit) || 0;
    total += qty * cost;
  }

  return total;
}

// ---------- LABOUR COST (per unit) ----------
async function computeLabourCost(tenantId) {
  const res = await db.query(SQL.GET_LABOUR, [tenantId]);
  const rows = res.rows || [];
  if (!rows.length) return 0;

  const today = new Date();
  const active = rows.filter(l => {
    const from = l.start_date ? new Date(l.start_date) : null;
    const to = l.end_date ? new Date(l.end_date) : null;
    return (!from || today >= from) && (!to || today <= to);
  });

  if (!active.length) return 0;

  let totalLabour = 0;
  for (const l of active) {
    const amount = Number(l.amount) || 0;
    const estSales = Number(l.estimated_monthly_sales) || 1; // protect division by zero
    const perUnit = amount / estSales;
    totalLabour += perUnit;
  }
  return totalLabour; // already per unit
}

// ---------- OPEX (per unit) ----------
async function computeOpex(tenantId, preOpexCOGS) {
  const res = await db.query(SQL.GET_OPEX, [tenantId]);
  const rows = res.rows || [];
  if (!rows.length) return 0;

  const today = new Date();
  let totalOpex = 0;
  console.log(rows);
  

  for (const o of rows) {
  const estSales = Number(o.estimated_monthly_sales) || 1;

  if (o.allocation_mode === 'fixed') {
    const perUnit = (Number(o.amount) || 0) / estSales;
    console.log(`OPEX row: name=${o.name}, amount=${o.amount}, estSales=${estSales}, perUnit=${perUnit}`);
    totalOpex += perUnit;
  } else if (o.allocation_mode === 'percent_of_cogs') {
    const perUnit = (Number(o.percentage_value || 0) / 100) * preOpexCOGS;
    totalOpex += perUnit;
  }
}
  return totalOpex;
}

// ---------- MAIN ----------
async function computeProductCost(productId, tenantId, options = {}) {
  const batchSize = options.batchSize && Number(options.batchSize) > 0 ? Number(options.batchSize) : 1;

  // 1) recipe total for batch + components
  const { totalRecipeCost, components } = await computeRecipeCost(productId, tenantId);
  const recipeCostPerUnit = totalRecipeCost / batchSize;

  // 2) packaging (total for batch -> per unit)
  const totalPackagingCost = await computePackagingCost(productId, tenantId);
  const packagingCostPerUnit = totalPackagingCost / batchSize;

  // 3) labour per unit (already per unit)
  const labourCostPerUnit = await computeLabourCost(tenantId);

  // 4) pre-OPEX COGS (per unit)
  const preOpexCOGS = recipeCostPerUnit + packagingCostPerUnit + labourCostPerUnit;

  // 5) OPEX per unit
  const opexCostPerUnit = await computeOpex(tenantId, preOpexCOGS);

  // 6) TCOP per unit
  const TCOP = preOpexCOGS + opexCostPerUnit;

  // 7) selling price & margin
  let sellingPrice = null;
  let marginPercent = null;

  if (options.marginPercent != null && options.marginPercent !== '') {
    const mp = Number(options.marginPercent);
    if (!Number.isNaN(mp) && mp > 0 && mp < 1) {
      sellingPrice = TCOP / (1 - mp);
      marginPercent = mp;
    }
  } else if (options.sellingPrice != null && options.sellingPrice !== '') {
    const sp = Number(options.sellingPrice);
    if (!Number.isNaN(sp) && sp > 0) {
      sellingPrice = sp;
      marginPercent = (sp - TCOP) / sp;
    }
  }

  return {
    recipe_components: components,
    recipe_cost: recipeCostPerUnit,
    packaging_cost: packagingCostPerUnit,
    labour_cost: labourCostPerUnit,
    opex_cost: opexCostPerUnit,
    COGS: preOpexCOGS,
    TCOP,
    selling_price: sellingPrice,
    margin_percent: marginPercent
  };
}

module.exports = { computeProductCost };

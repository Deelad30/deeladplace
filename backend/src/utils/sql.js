// src/utils/sql.js

const GET_LATEST_PURCHASE = `
  SELECT purchase_price, purchase_qty
  FROM material_purchases
  WHERE material_id = $1 AND tenant_id = $2
  ORDER BY purchase_date DESC, id DESC
  LIMIT 1
`;

const GET_RECIPE_MATERIALS = `
  SELECT r.material_id, r.recipe_qty, r.batch_qty, r.measurement_unit,
         m.name AS material_name
  FROM recipes r
  JOIN raw_materials m ON m.id = r.material_id
  WHERE r.product_id = $1 AND r.tenant_id = $2
`;

const GET_PACKAGING = `
  SELECT cost_per_unit FROM packaging_items WHERE tenant_id = $1
`;

const GET_PACKAGING_FOR_PRODUCT =  `
  SELECT pp.qty, p.cost_per_unit
  FROM product_packaging pp
  JOIN packaging p ON p.id = pp.packaging_id
  WHERE pp.product_id = $1 AND pp.tenant_id = $2
`;

const GET_LABOUR = `
  SELECT amount FROM labour_costs WHERE tenant_id = $1
`;

const GET_OPEX = `
  SELECT name, amount, allocation_mode, percentage_value
  FROM opex_items
  WHERE tenant_id = $1
`;

const GET_LATEST_STANDARD = `
  SELECT * FROM standard_costs
  WHERE product_id = $1 AND tenant_id = $2
  ORDER BY id DESC LIMIT 1
`;


module.exports = {
  GET_LATEST_PURCHASE,
  GET_RECIPE_MATERIALS,
  GET_PACKAGING,
  GET_LABOUR,
  GET_OPEX,
  GET_PACKAGING_FOR_PRODUCT,
  GET_LATEST_STANDARD
};

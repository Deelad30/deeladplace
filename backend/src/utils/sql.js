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

const GET_EXPECTED_MATERIAL_USAGE = `
    SELECT 
        r.material_id,
        rm.name AS material_name,
        SUM(r.recipe_qty * sp.computed_sales_qty) AS expected_usage
    FROM recipes r
    JOIN sic_products sp ON sp.product_id = r.product_id
    JOIN raw_materials rm ON rm.id = r.material_id
    WHERE r.tenant_id = $1
      AND sp.date BETWEEN $2 AND $3
    GROUP BY r.material_id, rm.name;
  `;


const GET_ACTUAL_MATERIAL_USAGE =  `
    SELECT 
        material_id,
        SUM(issues_qty + waste_qty) AS actual_usage
    FROM sic_raw_materials
    WHERE tenant_id = $1
      AND date BETWEEN $2 AND $3
    GROUP BY material_id;
  `;

const GET_MATERIAL_UNIT_COST =  `
    SELECT purchase_price, purchase_qty
    FROM material_purchases
    WHERE material_id = $1 AND tenant_id = $2
    ORDER BY created_at DESC
    LIMIT 1;
  `;
 
const GET_PRODUCT_SALES_QTY = `
  SELECT product_id, SUM(computed_sales_qty) AS qty
  FROM sic_products
  WHERE tenant_id = $1
    AND date BETWEEN $2 AND $3
  GROUP BY product_id;
`;

const GET_POS_ACTUAL_SALES = `
  SELECT psi.product_id, SUM(psi.qty * psi.selling_price) AS actual_sales
  FROM pos_sale_items psi
  JOIN pos_sales ps ON psi.sale_id = ps.id
  WHERE ps.tenant_id = $1
    AND ps.date BETWEEN $2 AND $3
  GROUP BY psi.product_id;
`;





module.exports = {
  GET_LATEST_PURCHASE,
  GET_RECIPE_MATERIALS,
  GET_PACKAGING,
  GET_LABOUR,
  GET_OPEX,
  GET_PACKAGING_FOR_PRODUCT,
  GET_LATEST_STANDARD,
  GET_EXPECTED_MATERIAL_USAGE,
  GET_ACTUAL_MATERIAL_USAGE,
  GET_MATERIAL_UNIT_COST,
  GET_PRODUCT_SALES_QTY,
  GET_POS_ACTUAL_SALES   
};

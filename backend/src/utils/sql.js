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

const GET_LABOUR = `SELECT amount, estimated_monthly_sales, start_date, end_date
FROM labour_costs
WHERE tenant_id = $1`;


const GET_OPEX = `
SELECT name, amount, estimated_monthly_sales, allocation_mode, percentage_value, effective_from, effective_to
FROM opex_items
WHERE tenant_id = $1
`;

const GET_LABOUR_FOR_PRODUCT = `
  SELECT pl.id, pl.labour_id, pl.amount, l.name AS labour_name
  FROM product_labour pl
  JOIN labour_costs l ON l.id = pl.labour_id
  WHERE pl.product_id = $1 AND pl.tenant_id = $2
`;

const GET_OPEX_FOR_PRODUCT = `
  SELECT po.id, po.opex_id, po.amount, o.name AS opex_name, 
         o.allocation_mode, o.percentage_value
  FROM product_opex po
  JOIN opex_items o ON o.id = po.opex_id
  WHERE po.product_id = $1 AND po.tenant_id = $2
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

const LIST_ITEMS = `    SELECT 
      m.id,
      m.name,
      m.measurement_unit,
      m.min_stock_level,
      COALESCE(
        (SELECT SUM(CASE WHEN movement_type='in' THEN qty ELSE 0 END) 
           - SUM(CASE WHEN movement_type='out' THEN qty ELSE 0 END)
         FROM stock_movements
         WHERE item_type='material'
         AND item_id=m.id
         AND tenant_id=$1),0
      ) AS stock_balance,
      COALESCE(
        (SELECT AVG(purchase_price / purchase_qty)
         FROM material_purchases
         WHERE material_id=m.id
         AND tenant_id=$1),0
      ) AS avg_cost
    FROM raw_materials m
    WHERE m.tenant_id=$1
    ORDER BY m.id DESC
`;

const CREATE_MATERIAL= `
INSERT INTO raw_materials (tenant_id, name, measurement_unit, min_stock_level)
    VALUES ($1,$2,$3,$4)
    RETURNING *
`;

const UPDATE_MATERIAL = `UPDATE raw_materials
    SET name=$2, measurement_unit=$3, min_stock_level=$5
    WHERE id=$1 AND tenant_id=$4
    RETURNING *
`;

const DELETE_MATERIAL = `
    DELETE FROM raw_materials
    WHERE id=$1 AND tenant_id=$2
`
const LIST_PURCHASES = `SELECT 
        p.*, 
        m.name AS material_name,
        m.min_stock_level,
        v.name AS vendor_name
    FROM material_purchases p
    JOIN raw_materials m ON m.id=p.material_id
    LEFT JOIN vendors v ON v.id=p.vendor_id
    WHERE p.tenant_id=$1
    ORDER BY p.id DESC
`
const CREATE_PURCHASE = `INSERT INTO material_purchases 
    (tenant_id, material_id, purchase_price, purchase_qty, vendor_id, purchase_date, measurement_unit)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *`


const GET_MATERIAL_BY_NAME = `
    SELECT id FROM raw_materials 
    WHERE LOWER(name) = LOWER($1) AND tenant_id = $2
    LIMIT 1;
`;

module.exports = {
  UPDATE_MATERIAL,
  DELETE_MATERIAL,
  LIST_PURCHASES,
  CREATE_PURCHASE,
  LIST_ITEMS,
  CREATE_MATERIAL,
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
  GET_POS_ACTUAL_SALES,
  GET_MATERIAL_BY_NAME,
  GET_LABOUR_FOR_PRODUCT,
  GET_OPEX_FOR_PRODUCT
};

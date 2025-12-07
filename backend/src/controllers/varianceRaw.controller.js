// controllers/varianceRaw.controller.js
const db = require("../config/database");

exports.getRawMaterialVariance = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { start_date, end_date } = req.query;

    const dateFilterPOS = start_date && end_date
      ? `AND DATE(ps.created_at) BETWEEN '${start_date}' AND '${end_date}'`
      : "";

    const dateFilterSIC = start_date && end_date
      ? `AND DATE(sr.date) BETWEEN '${start_date}' AND '${end_date}'`
      : "";

    const sql = `
      SELECT
        m.id AS material_id,
        m.name AS material_name,

        -- EXPECTED usage (recipe × product sales)
        COALESCE((
          SELECT SUM(ri.qty * ps.qty)
          FROM recipe_items ri
          JOIN pos_sales ps ON ps.product_id = ri.product_id
          WHERE ri.material_id = m.id
            AND ps.tenant_id = $1
            ${dateFilterPOS}
        ), 0) AS expected_usage,

        -- ACTUAL usage (from SIC raw)
        COALESCE((
          SELECT SUM(sr.computed_usage)
          FROM sic_raw_materials sr
          WHERE sr.material_id = m.id
            AND sr.tenant_id = $1
            ${dateFilterSIC}
        ), 0) AS sic_actual_usage,

        -- SYSTEM usage (issue to production)
        COALESCE((
          SELECT SUM(sm.qty)
          FROM stock_movements sm
          WHERE sm.item_type = 'material'
            AND sm.item_id = m.id
            AND sm.tenant_id = $1
            AND sm.movement_type = 'issue'
            ${start_date && end_date ? `AND DATE(sm.created_at) BETWEEN '${start_date}' AND '${end_date}'` : ""}
        ), 0) AS system_actual_usage,

        -- Weighted average cost
        (
          SELECT average_cost
          FROM stock_balance sb
          WHERE sb.material_id = m.id
            AND sb.tenant_id = $1
            AND sb.item_type = 'material'
          LIMIT 1
        ) AS average_cost
      FROM materials m
      WHERE m.tenant_id = $1;
    `;

    const result = await db.query(sql, [tenantId]);

    const items = result.rows.map(row => {
      const expected = Number(row.expected_usage);
      const sicActual = Number(row.sic_actual_usage || 0);
      const systemActual = Number(row.system_actual_usage || 0);

      // You can choose which "actual" to use
      const actual = Math.max(sicActual, systemActual); // best practice

      const varianceQty = actual - expected;
      const unitCost = Number(row.average_cost || 0);

      return {
        material_id: row.material_id,
        material_name: row.material_name,

        expected_usage: expected,
        actual_usage_sic: sicActual,
        actual_usage_system: systemActual,
        actual_usage: actual,

        variance_qty: varianceQty,
        unit_cost: unitCost,
        variance_value: varianceQty * unitCost
      };
    });

    return res.json({ ok: true, items });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Error computing raw variance" });
  }
};

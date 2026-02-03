// controllers/varianceRaw.controller.js
const db = require("../config/database");
const logger = require('../utils/logger');

exports.getRawMaterialVariance = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { start_date, end_date } = req.query;

    let filters = [`m.tenant_id = $1`];
    let posFilters = [`ps.tenant_id = $1`];
    let sicFilters = [`sr.tenant_id = $1`];
    let stockFilters = [`sm.tenant_id = $1`, `sm.item_type = 'material'`, `sm.movement_type = 'issue'`];
    
    let values = [tenantId];
    let idx = 2;

    if (start_date) {
      posFilters.push(`DATE(ps.created_at) >= $${idx}`);
      sicFilters.push(`DATE(sr.date) >= $${idx}`);
      stockFilters.push(`DATE(sm.created_at) >= $${idx}`);
      values.push(start_date);
      idx++;
    }
    if (end_date) {
      posFilters.push(`DATE(ps.created_at) <= $${idx}`);
      sicFilters.push(`DATE(sr.date) <= $${idx}`);
      stockFilters.push(`DATE(sm.created_at) <= $${idx}`);
      values.push(end_date);
      idx++;
    }

    const sql = `
      SELECT
        m.id AS material_id,
        m.name AS material_name,

        -- EXPECTED usage (recipe × product sales)
        COALESCE((
          SELECT SUM(r.recipe_qty * ps.qty)
          FROM recipes r
          JOIN pos_sales ps ON ps.product_id = r.product_id
          WHERE r.material_id = m.id
            AND ${posFilters.join(" AND ")}
        ), 0) AS expected_usage,

        -- ACTUAL usage (from SIC raw manual count, stored in system_usage)
        COALESCE((
          SELECT SUM(sr.system_usage)
          FROM sic_raw_materials sr
          WHERE sr.material_id = m.id
            AND ${sicFilters.join(" AND ")}
        ), 0) AS sic_actual_usage,

        -- SYSTEM usage (issue to production)
        COALESCE((
          SELECT SUM(sm.qty)
          FROM stock_movements sm
          WHERE sm.item_id = m.id
            AND ${stockFilters.join(" AND ")}
        ), 0) AS system_actual_usage,

        -- Weighted average cost
        (
          SELECT average_cost
          FROM stock_balance sb
          WHERE sb.item_id = m.id
            AND sb.tenant_id = $1
            AND sb.item_type = 'material'
          LIMIT 1
        ) AS average_cost
      FROM raw_materials m
      WHERE ${filters.join(" AND ")};
    `;

    const result = await db.query(sql, values);

    const items = result.rows.map(row => {
      const expected = Number(row.expected_usage);
      const sicActual = Number(row.sic_actual_usage || 0);
      const systemActual = Number(row.system_actual_usage || 0);

      // Use the SIC Actual usage (from physical count) as the primary source of truth
      const actual = sicActual; 

      // Formula: variance = expected - actual (Matching doc)
      // Negative = over usage (missing), Positive = under usage
      const varianceQty = expected - actual; 
      const unitCost = Number(row.average_cost || 0);

      let remark = "Good";
      if (varianceQty < 0) remark = "Over usage / Missing";       
      else if (varianceQty > 0) remark = "Under usage";           

      // Suspicious threshold: e.g., more than 10% difference
      if (Math.abs(varianceQty) > (expected * 0.1) && expected > 0) {
          remark = "Suspicious variance";
      }

      return {
        material_id: row.material_id,
        material_name: row.material_name,

        expected_usage: expected,
        actual_usage_sic: sicActual,
        actual_usage_system: systemActual,
        actual_usage: actual,

        variance_qty: varianceQty,
        unit_cost: unitCost,
        variance_value: varianceQty * unitCost,

        remark
      };
    });

    return res.json({ ok: true, items });
  } catch (err) {
    logger.error('Failed to fetch raw material variance', { error: err.message });
    return res.status(500).json({ ok: false, message: "Error computing raw variance" });
  }
};

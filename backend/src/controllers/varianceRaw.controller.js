const db = require("../config/database");
const SQL = require("../utils/sql");

exports.getRawMaterialVariance = async (req, res) => {
  try {
    const tenantId = req.user.tenant_id;
    const { start, end } = req.query;

    const expected = await db.query(SQL.GET_EXPECTED_MATERIAL_USAGE, [
      tenantId,
      start,
      end,
    ]);

    const actual = await db.query(SQL.GET_ACTUAL_MATERIAL_USAGE, [
      tenantId,
      start,
      end,
    ]);

    const actualMap = {};
    actual.rows.forEach(a => actualMap[a.material_id] = Number(a.actual_usage));

    let results = [];

    for (const row of expected.rows) {
      const materialId = row.material_id;

      const unitCostRes = await db.query(SQL.GET_MATERIAL_UNIT_COST, [
        materialId,
        tenantId,
      ]);

      let unitCost = 0;
      if (unitCostRes.rows.length > 0) {
        const u = unitCostRes.rows[0];
        unitCost = Number(u.purchase_price) / Number(u.purchase_qty);
      }

      const expected_usage = Number(row.expected_usage);
      const actual_usage = Number(actualMap[materialId] || 0);
      const variance_qty = expected_usage - actual_usage;
      const variance_value = variance_qty * unitCost;

      results.push({
        material_id: materialId,
        material_name: row.material_name,
        expected_usage,
        actual_usage,
        unit_cost: unitCost,
        variance_qty,
        variance_value,
      });
    }

    res.json({ ok: true, items: results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: "Error computing raw variance" });
  }
};

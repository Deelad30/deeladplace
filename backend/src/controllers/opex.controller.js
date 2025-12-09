const db = require('../config/database');

// CREATE OPEX
exports.createOpex = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { name, allocation_mode, amount, percentage_value, estimated_monthly_sales, effective_from, effective_to } = req.body;

  if (!name || !allocation_mode || !estimated_monthly_sales) {
    return res.status(400).json({ success: false, message: "name and allocation_mode and estimated_monthly_sales required" });
  }

  if (allocation_mode === "fixed" && !amount) {
    return res.status(400).json({ success: false, message: "amount required for fixed OPEX" });
  }

  if (allocation_mode === "percent_of_cogs" && !percentage_value) {
    return res.status(400).json({ success: false, message: "percentage_value required for percent_of_cogs" });
  }

  try {
    const result = await db.query(
      `INSERT INTO opex_items
       (tenant_id, name, amount, allocation_mode, percentage_value, estimated_monthly_sales, effective_from, effective_to)
       VALUES ($1,$2,$3,$4,$5,$6,$7, $8)
       RETURNING *`,
      [tenantId, name, amount, allocation_mode, percentage_value, estimated_monthly_sales, effective_from, effective_to]
    );

    res.json({ success: true, opex: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create OPEX item" });
  }
};

// GET OPEX
exports.getOpex = async (req, res) => {
  const tenantId = req.user.tenant_id;

  try {
    const result = await db.query(
      `SELECT * FROM opex_items WHERE tenant_id=$1 ORDER BY id DESC`,
      [tenantId]
    );

    res.json({ success: true, opex: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch OPEX items" });
  }
};

// UPDATE OPEX
exports.updateOpex = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const opexId = Number(req.params.id);
  const { name, allocation_mode, amount, percentage_value, estimated_monthly_sales, effective_from, effective_to } = req.body;

  if (!name || !allocation_mode) {
    return res.status(400).json({ success: false, message: "name and allocation_mode required" });
  }

  if (allocation_mode === "fixed" && !amount) {
    return res.status(400).json({ success: false, message: "amount required for fixed OPEX" });
  }

  if (allocation_mode === "percent_of_cogs" && !percentage_value) {
    return res.status(400).json({ success: false, message: "percentage_value required for percent_of_cogs" });
  }

  try {
    const result = await db.query(
      `UPDATE opex_items
       SET name=$1, allocation_mode=$2, amount=$3, percentage_value=$4, estimated_monthly_sales=$5, effective_from=$6, effective_to=$7
       WHERE id=$8 AND tenant_id=$9
       RETURNING *`,
      [name, allocation_mode, amount, percentage_value, estimated_monthly_sales, effective_from, effective_to, opexId, tenantId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "OPEX item not found" });
    }

    res.json({ success: true, opex: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update OPEX item" });
  }
};

// DELETE OPEX
exports.deleteOpex = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const opexId = Number(req.params.id);

  try {
    const result = await db.query(
      `DELETE FROM opex_items WHERE id=$1 AND tenant_id=$2 RETURNING *`,
      [opexId, tenantId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "OPEX item not found" });
    }

    res.json({ success: true, message: "OPEX item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete OPEX item" });
  }
};

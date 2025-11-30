const db =  require('../config/database');

exports.createOpex = async (req, res) => {
  const tenantId = req.user.tenant_id;

  const {
    name,
    allocation_mode,
    amount,
    percentage_value,
    effective_from,
    effective_to
  } = req.body;

  if (!name || !allocation_mode) {
    return res.status(400).json({ success: false, message: "name and allocation_mode required" });
  }

  if (allocation_mode === "fixed" && !amount) {
    return res.status(400).json({ success: false, message: "amount is required for fixed OPEX" });
  }

  if (allocation_mode === "percent_of_cogs" && !percentage_value) {
    return res.status(400).json({ success: false, message: "percentage_value required for percent_of_cogs" });
  }

  try {
    const result = await db.query(
      `INSERT INTO opex_items
       (tenant_id, name, amount, allocation_mode, percentage_value, effective_from, effective_to)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [tenantId, name, amount, allocation_mode, percentage_value, effective_from, effective_to]
    );

    res.json({ success: true, opex: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create OPEX item"
    });
  }
};

exports.getOpex = async (req, res) => {
  const tenantId = req.user.tenant_id;

  try {
    const result = await db.query(
      `SELECT * FROM opex_items WHERE tenant_id = $1 ORDER BY id DESC`,
      [tenantId]
    );

    res.json({ success: true, opex: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch OPEX items"
    });
  }
};

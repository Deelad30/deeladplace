const db = require('../config/database');

// CREATE LABOUR
exports.createLabour = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { name, amount, allocation_type, start_date, end_date } = req.body;

  if (!name || !amount || !allocation_type) {
    return res.status(400).json({ success: false, message: "name, amount, allocation_type required" });
  }

  if (allocation_type !== "fixed") {
    return res.status(400).json({ success: false, message: "allocation_type must be 'fixed'" });
  }

  try {
    const result = await db.query(
      `INSERT INTO labour_costs (tenant_id, name, amount, allocation_type, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [tenantId, name, amount, allocation_type, start_date, end_date]
    );

    res.json({ success: true, labour: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create labour record" });
  }
};

// GET LABOUR
exports.getLabour = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    const result = await db.query(
      `SELECT * FROM labour_costs WHERE tenant_id = $1 ORDER BY id DESC`,
      [tenantId]
    );
    res.json({ success: true, labour: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch labour records" });
  }
};

// UPDATE LABOUR
exports.updateLabour = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const labourId = Number(req.params.id);
  const { name, amount, allocation_type, start_date, end_date } = req.body;

  if (!name || !amount || !allocation_type) {
    return res.status(400).json({ success: false, message: "name, amount, allocation_type required" });
  }

  try {
    const result = await db.query(
      `UPDATE labour_costs
       SET name=$1, amount=$2, allocation_type=$3, start_date=$4, end_date=$5
       WHERE id=$6 AND tenant_id=$7
       RETURNING *`,
      [name, amount, allocation_type, start_date, end_date, labourId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Labour record not found" });
    }

    res.json({ success: true, labour: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update labour record" });
  }
};

// DELETE LABOUR
exports.deleteLabour = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const labourId = Number(req.params.id);

  try {
    const result = await db.query(
      `DELETE FROM labour_costs WHERE id=$1 AND tenant_id=$2 RETURNING *`,
      [labourId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Labour record not found" });
    }

    res.json({ success: true, message: "Labour record deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete labour record" });
  }
};

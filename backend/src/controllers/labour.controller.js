const db = require('../config/database');

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
    return res.status(500).json({ success: false, message: "Failed to fetch labour records" });
  }
};

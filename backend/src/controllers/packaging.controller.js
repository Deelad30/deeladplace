const db = require('../config/database');

exports.createPackaging = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { name, cost_per_unit } = req.body;

  if (!name || !cost_per_unit) {
    return res.status(400).json({ success: false, message: "name and cost_per_unit required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO packaging (tenant_id, name, cost_per_unit)
       VALUES ($1, $2, $3) RETURNING *`,
      [tenantId, name, cost_per_unit]
    );

    res.json({ success: true, packaging: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Create packaging failed" });
  }
};

exports.getPackaging = async (req, res) => {
  const tenantId = req.user.tenant_id;

  try {
    const result = await db.query(
      `SELECT * FROM packaging WHERE tenant_id = $1 ORDER BY id DESC`,
      [tenantId]
    );

    res.json({ success: true, packaging: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Fetch packaging failed" });
  }
};

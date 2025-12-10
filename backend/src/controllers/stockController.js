const db = require('../config/database');

// CREATE Stock Item
exports.createStockItem = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { name, stock_quantity, measurement_unit, date_stocked, alarm_threshold } = req.body;

  if (!name || !measurement_unit || stock_quantity == null) {
    return res.status(400).json({ success: false, message: "Name, stock_quantity, measurement_unit required" });
  }

  try {
    const result = await db.query(
      `INSERT INTO stock_items (tenant_id, name, stock_quantity, measurement_unit, date_stocked, alarm_threshold)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [tenantId, name, stock_quantity, measurement_unit, date_stocked || new Date(), alarm_threshold || 5]
    );

    res.status(201).json({ success: true, stockItem: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to create stock item" });
  }
};

// GET All Stock Items
exports.getStockItems = async (req, res) => {
  const tenantId = req.user.tenant_id;

  try {
    const result = await db.query(
      `SELECT * FROM stock_items WHERE tenant_id=$1 ORDER BY id DESC`,
      [tenantId]
    );
    res.json({ success: true, stockItems: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch stock items" });
  }
};

// UPDATE Stock Item
exports.updateStockItem = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const { name, stock_quantity, measurement_unit, date_stocked, alarm_threshold } = req.body;

  try {
    const result = await db.query(
  `UPDATE stock_items
   SET name=$1, stock_quantity=$2, measurement_unit=$3, date_stocked=$4, alarm_threshold=$5, updated_at=NOW()
   WHERE id=$6 AND tenant_id=$7
   RETURNING *`,
  [
    name,
    stock_quantity,
    measurement_unit,
    date_stocked || new Date(), // fallback to current timestamp
    alarm_threshold,
    id,
    tenantId
  ]
);


    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Stock item not found" });
    }

    res.json({ success: true, stockItem: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to update stock item" });
  }
};

// DELETE Stock Item
exports.deleteStockItem = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;

  try {
    const result = await db.query(
      `DELETE FROM stock_items WHERE id=$1 AND tenant_id=$2 RETURNING *`,
      [id, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Stock item not found" });
    }

    res.json({ success: true, message: "Stock item deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to delete stock item" });
  }
};

// ADJUST Stock Quantity (+ or -)
exports.adjustStockQuantity = async (req, res) => {
  const tenantId = req.user.tenant_id;
  const { id } = req.params;
  const { adjustment } = req.body;

  try {
    const current = await db.query(
      `SELECT stock_quantity FROM stock_items WHERE id=$1 AND tenant_id=$2`,
      [id, tenantId]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Stock item not found" });
    }

    const qty = Number(current.rows[0].stock_quantity);
    const adj = Number(adjustment);

    if (qty + adj < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock cannot go below zero"
      });
    }

    const result = await db.query(
      `UPDATE stock_items
       SET stock_quantity = stock_quantity + $1, updated_at=NOW()
       WHERE id=$2 AND tenant_id=$3
       RETURNING *`,
      [adj, id, tenantId]
    );

    res.json({ success: true, stockItem: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to adjust stock quantity" });
  }
};


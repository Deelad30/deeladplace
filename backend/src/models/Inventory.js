const database = require('../config/database');

class Inventory {
    static async createMovement(movementData) {
    const { raw_material_id, opening, issues, waste, closing, movement_date } = movementData;

    const usage = (opening + issues) - (waste + closing);

    const result = await database.query(
      `INSERT INTO inventory_movements 
      (raw_material_id, opening_stock, issues, waste, closing_stock, usage, movement_date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [raw_material_id, opening, issues, waste, closing, usage, movement_date]
    );

    return result.rows[0];
  }

 static async getMovementsByDate(date) {
  const result = await database.query(
    `SELECT im.*, rm.name AS raw_material_name
     FROM inventory_movements im
     JOIN raw_materials rm ON im.raw_material_id = rm.id
     WHERE DATE(im.movement_date) = $1
     ORDER BY im.raw_material_id`,
    [date]
  );
  return result.rows;
}


  static async getAllStockLevels() {
  const result = await database.query(`
    SELECT 
      rm.id as raw_material_id,
      rm.name, 
      rm.min_stock_level, 
      im.closing_stock, 
      im.movement_date
    FROM raw_materials rm
    LEFT JOIN LATERAL (
      SELECT * 
      FROM inventory_movements im 
      WHERE im.raw_material_id = rm.id
      ORDER BY im.movement_date DESC
      LIMIT 1
    ) im ON true
    ORDER BY rm.name
  `);
  return result.rows;
}


  static async getLowStockAlerts() {
      const result = await database.query(`
    SELECT rm.name, rm.min_stock_level, im.closing_stock, im.movement_date
    FROM raw_materials rm
    JOIN inventory_movements im ON rm.id = im.raw_material_id
    WHERE im.movement_date = (SELECT MAX(movement_date) FROM inventory_movements)
      AND im.closing_stock <= rm.min_stock_level
  `);
  return result.rows;
}


}

module.exports = Inventory;
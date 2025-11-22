const database = require('../config/database');

class RawMaterial {
  // CREATE
  static async create({ name, unit, current_cost }) {
    const result = await database.query(
      'INSERT INTO raw_materials (name, unit, current_cost) VALUES ($1, $2, $3) RETURNING *',
      [name, unit, current_cost]
    );
    return result.rows[0];
  }

  // GET ALL
  static async getAll() {
    const result = await database.query(
      'SELECT * FROM raw_materials ORDER BY created_at DESC'
    );
    return result.rows;
  }

  // GET BY ID
  static async getById(id) {
    const result = await database.query(
      'SELECT * FROM raw_materials WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  // UPDATE
  static async update(id, { name, unit, current_cost }) {
    const result = await database.query(
      'UPDATE raw_materials SET name = $1, unit = $2, current_cost = $3 WHERE id = $4 RETURNING *',
      [name, unit, current_cost, id]
    );
    return result.rows[0];
  }

  // DELETE
  static async delete(id) {
    await database.query(
      'DELETE FROM raw_materials WHERE id = $1',
      [id]
    );
    return true;
  }
}

module.exports = RawMaterial;

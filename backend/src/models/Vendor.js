const database = require('../config/database');

class Vendor {
  static async findAll() {
    const result = await database.query('SELECT * FROM vendors ORDER BY name');
    return result.rows;
  }

  static async findById(id) {
    const result = await database.query('SELECT * FROM vendors WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(vendorData) {
    const { name, description, is_active } = vendorData;
    const result = await database.query(
       'INSERT INTO vendors (name, description, is_active) VALUES ($1, $2, $3) RETURNING *',
    [name, description, is_active]
    );
    return result.rows[0];
  }

  static async update(id, vendorData) {
    const { name, description, is_active } = vendorData;
    const result = await database.query(
      'UPDATE vendors SET name = $1, description = $2, is_active = $3 WHERE id = $4 RETURNING *',
      [name, description, is_active, id]
    );
    return result.rows[0];
  }

    static async delete(id) {
    const result = await database.query(
      'DELETE FROM vendors WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

}

module.exports = Vendor;
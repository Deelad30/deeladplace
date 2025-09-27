const database = require('../config/database');

class Product {
  static async findByVendor(vendorId) {
    const result = await database.query(
      'SELECT * FROM products WHERE vendor_id = $1 AND is_active = true ORDER BY name',
      [vendorId]
    );
    return result.rows;
  }

  static async findById(id) {
    const result = await database.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async create(productData) {
    const { vendor_id, name, description, vendor_price, custom_commission } = productData;
    const result = await database.query(
      'INSERT INTO products (vendor_id, name, description, vendor_price, custom_commission) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [vendor_id, name, description, vendor_price, custom_commission]
    );
    return result.rows[0];
  }
}

module.exports = Product;
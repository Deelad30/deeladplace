const database = require('../config/database');

class Product {
  // Fetch all products grouped by vendor
  static async findAllGroupedByVendor() {
    const result = await database.query(`
      SELECT 
        v.id AS vendor_id, 
        v.name AS vendor_name,
        p.id AS product_id, 
        p.name AS product_name,
        p.vendor_price, 
        p.custom_commission
      FROM vendors v
      LEFT JOIN products p ON v.id = p.vendor_id AND p.is_active = true
      ORDER BY v.name, p.name
    `);
    return result.rows;
  }

  // Fetch all vendors for dropdown
  static async findAllVendors() {
    const result = await database.query(
      'SELECT id, name FROM vendors ORDER BY name'
    );
    return result.rows;
  }

  // CRUD for products
  static async create({ vendor_id, name, description, vendor_price, custom_commission }) {
    const commission =
  custom_commission !== "" && custom_commission !== undefined && custom_commission !== null
    ? parseFloat(custom_commission)
    : null;


  const price = vendor_price !== "" && vendor_price !== undefined
    ? parseFloat(vendor_price)
    : 0; 
    const result = await database.query(
      `INSERT INTO products (vendor_id, name, description, vendor_price, custom_commission)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [vendor_id, name, description, price, commission]
    );
    return result.rows[0];
  }

  static async update(id, fields) {
    const keys = Object.keys(fields);
    const values = Object.values(fields);
    const setQuery = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

    const result = await database.query(
      `UPDATE products SET ${setQuery} WHERE id = $${keys.length + 1} RETURNING *`,
      [...values, id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await database.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  // Fetch all products with pagination
static async findAll(limit = 20, offset = 0) {
  const result = await database.query(
    `SELECT * FROM products ORDER BY name LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
}

static async findById(id) {
  const result = await database.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

// Get dashboard summary
static async getSummary() {
  const result = await database.query(
    `SELECT 
       COUNT(*) AS total_products,
       AVG(vendor_price) AS avg_vendor_price,
       AVG(custom_commission) AS avg_commission
     FROM products`
  );
  return result.rows[0];
}

// Get total count of products for pagination
static async getCountAll() {
  const result = await database.query(
    'SELECT COUNT(*) AS total FROM products'
  );
  return result.rows[0].total;
}

static async findByVendor(vendor_id, limit = 20, offset = 0) {
  const result = await database.query(
    `SELECT * FROM products 
     WHERE vendor_id = $1 
     ORDER BY name
     LIMIT $2 OFFSET $3`,
    [vendor_id, limit, offset]
  );
  return result.rows;
}

static async getCountByVendor(vendor_id) {
  const result = await database.query(
    `SELECT COUNT(*) AS total FROM products WHERE vendor_id = $1`,
    [vendor_id]
  );
  return result.rows[0].total;
}


}

module.exports = Product;

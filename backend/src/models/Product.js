// src/models/Product.js

const database = require('../config/database');

class Product {

  //
  // -----------------------
  // CREATE PRODUCT
  // -----------------------
  //
  static async create({
    tenant_id,
    vendor_id,
    name,
    description,
    vendor_price,
    custom_commission,
    sku,
    category_id
  }) {
    const result = await database.query(
      `
      INSERT INTO products
        (tenant_id, vendor_id, name, description, vendor_price, custom_commission, sku, category_id, is_active)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, true)
      RETURNING *
      `,
      [
        tenant_id,
        vendor_id || null,
        name,
        description || "",
        vendor_price || 0,
        custom_commission || 0,
        sku,
        category_id
      ]
    );

    return result.rows[0];
  }



  //
  // -----------------------
  // FIND ALL (tenant scoped)
  // -----------------------
  //
  static async findAll(tenant_id, limit = 20, offset = 0) {
    const result = await database.query(
      `
      SELECT *
      FROM products
      WHERE tenant_id = $1 AND is_active = true
      ORDER BY name
      LIMIT $2 OFFSET $3
      `,
      [tenant_id, limit, offset]
    );

    return result.rows;
  }



  //
  // -----------------------
  // COUNT ALL (tenant scoped)
  // -----------------------
  //
  static async getCountAll(tenant_id) {
    const result = await database.query(
      `
      SELECT COUNT(*) AS total
      FROM products
      WHERE tenant_id = $1 AND is_active = true
      `,
      [tenant_id]
    );

    return Number(result.rows[0].total);
  }



  //
  // -----------------------
  // FIND BY VENDOR (tenant scoped)
  // -----------------------
  //
  static async findByVendor(tenant_id, vendor_id, limit = 20, offset = 0) {
    const result = await database.query(
      `
      SELECT *
      FROM products
      WHERE tenant_id = $1 AND vendor_id = $2 AND is_active = true
      ORDER BY name
      LIMIT $3 OFFSET $4
      `,
      [tenant_id, vendor_id, limit, offset]
    );

    return result.rows;
  }



  //
  // -----------------------
  // COUNT BY VENDOR
  // -----------------------
  //
  static async getCountByVendor(tenant_id, vendor_id) {
    const result = await database.query(
      `
      SELECT COUNT(*) AS total
      FROM products
      WHERE tenant_id = $1 AND vendor_id = $2 AND is_active = true
      `,
      [tenant_id, vendor_id]
    );

    return Number(result.rows[0].total);
  }



  //
  // -----------------------
  // UPDATE PRODUCT (secure)
  // Only update if product belongs to tenant
  // -----------------------
  //
  static async update(id, tenant_id, fields) {

    // build dynamic query
    const keys = Object.keys(fields);
    const values = Object.values(fields);

    if (keys.length === 0) return null;

    const setQuery = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    const result = await database.query(
      `
      UPDATE products
      SET ${setQuery}
      WHERE id = $${keys.length + 1} AND tenant_id = $${keys.length + 2}
      RETURNING *
      `,
      [...values, id, tenant_id]
    );

    return result.rows[0];
  }



  //
  // -----------------------
  // DELETE PRODUCT (soft delete or hard delete)
  // Now doing hard delete for simplicity
  // Tenant scoped
  // -----------------------
  //
  static async delete(id, tenant_id) {
    const result = await database.query(
      `
      DELETE FROM products
      WHERE id = $1 AND tenant_id = $2
      RETURNING id
      `,
      [id, tenant_id]
    );

    return result.rows[0];
  }



  //
  // -----------------------
  // FIND ALL VENDORS FOR TENANT
  // -----------------------
  //
  static async findAllVendors(tenant_id) {
    const result = await database.query(
      `
      SELECT id, name
      FROM vendors
      WHERE tenant_id = $1
      ORDER BY name
      `,
      [tenant_id]
    );

    return result.rows;
  }



  //
  // -----------------------
  // GROUP PRODUCTS BY VENDOR (tenant scoped)
  // -----------------------
  //
  static async findAllGroupedByVendor(tenant_id) {
    const result = await database.query(
      `
      SELECT
        v.id AS vendor_id,
        v.name AS vendor_name,
        p.id AS product_id,
        p.name AS product_name,
        p.vendor_price,
        p.custom_commission
      FROM vendors v
      LEFT JOIN products p
        ON v.id = p.vendor_id
        AND p.tenant_id = v.tenant_id
        AND p.is_active = true
      WHERE v.tenant_id = $1
      ORDER BY v.name, p.name
      `,
      [tenant_id]
    );

    return result.rows;
  }



  //
  // -----------------------
  // FIND BY ID (tenant scoped)
  // -----------------------
  //
  static async findById(id, tenant_id) {
    const result = await database.query(
      `
      SELECT *
      FROM products
      WHERE id = $1 AND tenant_id = $2
      `,
      [id, tenant_id]
    );

    return result.rows[0];
  }



  //
  // -----------------------
  // SUMMARY STATS (tenant scoped)
  // -----------------------
  //
  static async getSummary(tenant_id) {
    const result = await database.query(
      `
      SELECT
        COUNT(*) AS total_products,
        AVG(vendor_price) AS avg_vendor_price,
        AVG(custom_commission) AS avg_commission
      FROM products
      WHERE tenant_id = $1 AND is_active = true
      `,
      [tenant_id]
    );

    return result.rows[0];
  }

}

module.exports = Product;

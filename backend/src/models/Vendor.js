const database = require('../config/database');

class Vendor {
  /**
   * Get all vendors for a tenant
   */
  static async findAll({ tenantId }) {
    const result = await database.query(
      `SELECT id, tenant_id, name, description, is_active, created_at, updated_at
       FROM vendors
       WHERE tenant_id = $1
       ORDER BY name`,
      [tenantId]
    );
    return result.rows;
  }

  /**
   * Get specific vendor by ID (tenant scoped)
   */
  static async findById(id, { tenantId }) {
    const result = await database.query(
      `SELECT id, tenant_id, name, description, is_active, created_at, updated_at
       FROM vendors
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );
    return result.rows[0];
  }

  /**
   * Create vendor for tenant
   */
  static async create({ name, description, is_active = true, tenant_id }) {
    const result = await database.query(
      `INSERT INTO vendors (tenant_id, name, description, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING id, tenant_id, name, description, is_active, created_at, updated_at`,
      [tenant_id, name, description, is_active]
    );
    return result.rows[0];
  }

  /**
   * Update vendor (tenant-scoped)
   */
  static async update(id, vendorData, { tenantId }) {
    const { name, description, is_active } = vendorData;

    const result = await database.query(
      `UPDATE vendors
       SET name = $1,
           description = $2,
           is_active = $3,
           updated_at = NOW()
       WHERE id = $4 AND tenant_id = $5
       RETURNING id, tenant_id, name, description, is_active, created_at, updated_at`,
      [name, description, is_active, id, tenantId]
    );

    return result.rows[0];
  }

  /**
   * Delete vendor (tenant-scoped)
   */
  static async delete(id, { tenantId }) {
    const result = await database.query(
      `DELETE FROM vendors
       WHERE id = $1 AND tenant_id = $2
       RETURNING id`,
      [id, tenantId]
    );

    return result.rows[0];
  }
}

module.exports = Vendor;

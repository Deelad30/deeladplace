const database = require('../config/database');

class RawMaterial {

  /**
   * CREATE (tenant-scoped)
   */
  static async create({ tenant_id, name, measurement_unit, min_stock_level }) {
    const result = await database.query(
      `INSERT INTO raw_materials (tenant_id, name, measurement_unit, min_stock_level)
       VALUES ($1, $2, $3, $4)
       RETURNING id, tenant_id, name, measurement_unit, min_stock_level, created_at`,
      [tenant_id, name, measurement_unit, min_stock_level || 0]
    );

    return result.rows[0];
  }

  /**
   * GET ALL (tenant-scoped)
   */
  static async findAll({ tenantId }) {
    const result = await database.query(
      `SELECT id, tenant_id, name, measurement_unit, min_stock_level, created_at
       FROM raw_materials
       WHERE tenant_id = $1
       ORDER BY created_at DESC`,
      [tenantId]
    );

    return result.rows;
  }

  /**
   * GET BY ID (tenant-scoped)
   */
  static async findById(id, { tenantId }) {
    const result = await database.query(
      `SELECT id, tenant_id, name, measurement_unit, min_stock_level, created_at
       FROM raw_materials
       WHERE id = $1 AND tenant_id = $2`,
      [id, tenantId]
    );

    return result.rows[0];
  }

  /**
   * UPDATE (tenant-scoped)
   */
  static async update(id, { name, measurement_unit, min_stock_level }, { tenantId }) {
    const result = await database.query(
      `UPDATE raw_materials
       SET name = $1,
           measurement_unit = $2,
           min_stock_level = $3
       WHERE id = $4
         AND tenant_id = $5
       RETURNING id, tenant_id, name, measurement_unit, min_stock_level, created_at`,
      [name, measurement_unit, min_stock_level || 0, id, tenantId]
    );

    return result.rows[0];
  }

  /**
   * DELETE (tenant-scoped)
   */
  static async delete(id, { tenantId }) {
    const result = await database.query(
      `DELETE FROM raw_materials
       WHERE id = $1 AND tenant_id = $2
       RETURNING id`,
      [id, tenantId]
    );

    return result.rows[0];
  }
}

module.exports = RawMaterial;

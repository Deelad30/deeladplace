// src/models/User.js
const db = require('../config/database');

class User {

  // -----------------------------
  // FIND USER BY ID
  // -----------------------------
  static async findById(id) {
    const result = await db.query(
      `SELECT id, name, email, role_id, tenant_id, plan_type, subscription_code, created_at 
       FROM users 
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  // -----------------------------
  // FIND USER BY EMAIL
  // -----------------------------
  static async findByEmail(email) {
    const result = await db.query(
      `SELECT id, name, email, password_hash, role_id, tenant_id, plan_type, subscription_code 
       FROM users 
       WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  }

  // -----------------------------
  // CREATE USER
  // -----------------------------
  static async create({ name, email, password_hash, role_id, tenant_id }) {
    const result = await db.query(
      `INSERT INTO users (name, email, password_hash, role_id, tenant_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, role_id, tenant_id`,
      [name, email, password_hash, role_id, tenant_id]
    );

    return result.rows[0];
  }

  // -----------------------------
  // UPDATE SUBSCRIPTION PLAN
  // -----------------------------
  static async updatePlan(userId, planType, subscriptionCode = null) {
    console.log("Updating user plan:", { userId, planType, subscriptionCode });

    const result = await db.query(
      `UPDATE users 
       SET plan_type = $1, subscription_code = $2 
       WHERE id = $3
       RETURNING id, email, plan_type, subscription_code`,
      [planType, subscriptionCode, userId]
    );

    console.log("DB update result:", result.rows[0]);
    return result.rows[0];
  }
}

module.exports = User;

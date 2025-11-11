const database = require('../config/database');

class User {
  static async findById(id) {
    const result = await database.query(
      'SELECT id, name, email, role, plan, subscription_id, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByEmail(email) {
    const result = await database.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { name, email, password, role } = userData;
    const result = await database.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, role]
    );
    return result.rows[0];
  }

  static async updatePlan(userId, plan, subscriptionId = null) {
    const result = await database.query(
      'UPDATE users SET plan = $1, subscription_id = $2 WHERE id = $3 RETURNING id, name, email, plan',
      [plan, subscriptionId, userId]
    );
    return result.rows[0];
  }
}

module.exports = User;

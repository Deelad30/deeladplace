const jwt = require('jsonwebtoken');
const database = require('../config/database');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists in database
    const userResult = await database.query(
      `SELECT u.id, u.name, u.email, u.role_id, r.name as role_name 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [decoded.userId || decoded.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userResult.rows[0];
    req.user = {
      ...userData,
      role: userData.role_name // Map role_name to role for compatibility with other middlewares
    };
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

const requireManagerOrAdmin = (req, res, next) => {
  if (!['admin', 'manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Manager or admin access required'
    });
  }
  next();
};

const requireNonWaiter = (req, res, next) => {
  if (req.user.role === 'waiter') {
    return res.status(403).json({
      success: false,
      message: 'Waiters are not allowed to perform this action'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireManagerOrAdmin,
  requireNonWaiter
};
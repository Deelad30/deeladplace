const User = require('../models/User');
const logger = require('../utils/logger');

// -----------------------------
// GET USER BY ID
// -----------------------------
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        ok: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      ok: true,
      data: user
    });
  } catch (error) {
    logger.error('Get user by ID error', { error: error.message, userId: id });

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch user'
    });
  }
};

// -----------------------------
// GET ALL USERS BY TENANT
// -----------------------------
exports.getAllUsers = async (req, res) => {
  const tenantId = req.user.tenant_id;
  try {
    const users = await User.findAllByTenant(tenantId);

    return res.status(200).json({
      ok: true,
      users
    });
  } catch (error) {
    logger.error('Get all users error', { error: error.message, tenantId });

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch users'
    });
  }
};

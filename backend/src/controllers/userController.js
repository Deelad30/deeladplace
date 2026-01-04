const User = require('../models/User');

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
    console.error('Get user by ID error:', error);

    return res.status(500).json({
      ok: false,
      message: 'Failed to fetch user'
    });
  }
};

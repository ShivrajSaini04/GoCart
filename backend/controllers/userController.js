const User = require('../models/User');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (admin)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password'); // omit password hashes
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

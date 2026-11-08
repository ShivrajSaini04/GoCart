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

// @desc    Delete a user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Guard against an admin deleting their own currently logged-in account
    if (req.user && user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own admin account.' });
    }

    await user.deleteOne();
    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

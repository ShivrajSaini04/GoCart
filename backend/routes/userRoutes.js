const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { getAllUsers, deleteUser } = require('../controllers/userController');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (admin)
router.get('/', protect, admin, getAllUsers);

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private (admin)
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;

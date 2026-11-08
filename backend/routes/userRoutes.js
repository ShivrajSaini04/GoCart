const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { getAllUsers } = require('../controllers/userController');

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (admin)
router.get('/', protect, admin, getAllUsers);

module.exports = router;

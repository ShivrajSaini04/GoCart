const express = require('express');
const { createOrder, verifyPayment } = require('../controller/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new order
router.post('/order', protect, createOrder);

// Verify payment route
router.post('/verify', protect, verifyPayment);

module.exports = router;
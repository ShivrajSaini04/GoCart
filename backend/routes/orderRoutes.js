const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const { verified } = require("../middleware/verifiedMiddleware");
const { createOrder, getAllOrders, myOrders, updateOrderStatus, deleteOrder } = require("../controller/orderController");

const router = express.Router();

router.route("/")
    .post(protect, verified, createOrder)
    .get(protect, admin, getAllOrders);

router.route("/:id/myorders")
    .get(protect, myOrders);

router.route("/:id/status")
    .put(protect, admin, updateOrderStatus)
    // .delete(protect, admin, deleteOrder);

module.exports = router;
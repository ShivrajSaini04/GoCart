const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/multerAdmin");
const {
    getDashboardStats,
    getAllAdminProducts,
    getAllAdminOrders,
    updateOrderStatus,
    updateAdminProduct,
    deleteAdminProduct,
    getAllAdminUsers,
    getUserStats,
} = require("../controller/adminController");

const router = express.Router();

// Dashboard stats
router.get("/dashboard", protect, admin, getDashboardStats);
router.get("/users-stats", protect, admin, getUserStats);

// Products (admin)
router.get("/products", protect, admin, getAllAdminProducts);
router.put("/products/:id", protect, admin, upload.single("image"), updateAdminProduct);
router.delete("/products/:id", protect, admin, deleteAdminProduct);

// Orders (admin)
router.get("/orders", protect, admin, getAllAdminOrders);
router.put("/orders/:id/status", protect, admin, updateOrderStatus);

// Users (admin)
router.get("/users", protect, admin, getAllAdminUsers);

module.exports = router;
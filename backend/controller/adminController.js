const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const cloudinary = require("../config/cloudinary");

// ===================== DASHBOARD STATS =====================

const getDashboardStats = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({});
        const totalOrders = await Order.countDocuments({});
        const pendingOrders = await Order.countDocuments({ status: "pending" });
        const shippedOrders = await Order.countDocuments({ status: "shipped" });
        const deliveredOrders = await Order.countDocuments({ status: "delivered" });
        const totalUsers = await User.countDocuments({ role: "user" });
        const adminCount = await User.countDocuments({ role: "admin" });

        const totalIncome = await Order.aggregate([
            { $match: { status: { $in: ["shipped", "delivered"] } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const income = totalIncome.length ? totalIncome[0].total : 0;

        // Orders grouped by status
        const ordersByStatus = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        // Products grouped by category
        const productsByCategory = await Product.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate("user", "name email");

        res.json({
            totalProducts,
            totalOrders,
            pendingOrders,
            shippedOrders,
            deliveredOrders,
            placedOrders: totalOrders,
            totalUsers,
            adminCount,
            totalIncome: income,
            ordersByStatus,
            productsByCategory,
            recentOrders,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===================== ALL PRODUCTS (ADMIN) =====================

const getAllAdminProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        const query = {};
        if (category && category !== "all") query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Product.countDocuments(query);

        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===================== ALL ORDERS (ADMIN) =====================

const getAllAdminOrders = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;
        const query = {};
        if (status && status !== "all") query.status = status;
        if (search) {
            query.$or = [
                { "user.name": { $regex: search, $options: "i" } },
                { "user.email": { $regex: search, $options: "i" } },
                { _id: { $regex: search, $options: "i" } },
            ];
        }

        const orders = await Order.find(query)
            .populate("user", "name email verified role")
            .populate("items.product", "name price")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Order.countDocuments(query);

        res.json({
            orders,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===================== UPDATE ORDER STATUS =====================


// ===================== USER STATS =====================

const getUserStats = async (req, res) => {
    try {
        const usersByRole = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
        ]);
        const verifiedUsers = await User.countDocuments({ verified: true });
        const totalUsers = await User.countDocuments({});

        res.json({
            usersByRole,
            verifiedUsers,
            totalUsers,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id)
            .populate("user", "name email")
            .populate("items.product", "name price");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!["pending", "shipped", "delivered"].includes(status)) {
            return res
                .status(400)
                .json({ message: "Invalid status. Must be pending, shipped, or delivered." });
        }

        const previousStatus = order.status;
        order.status = status;
        await order.save();

        // Optional: notify user about status change
        let subject = "Your GoCart Order Status Update";
        let message = `Dear ${order.user.name},\n\nYour order #${order._id} has been updated.\nPrevious status: ${previousStatus}\nNew status: ${status}\n\nThank you for shopping with GoCart!\n\nBest regards,\nGoCart Team`;

        if (status === "shipped") {
            message = `Dear ${order.user.name},\n\nGreat news! Your order #${order._id} has been shipped.\n\nYou will receive a confirmation email once it is delivered.\n\nThank you for shopping with GoCart!\n\nBest regards,\nGoCart Team`;
            subject = "Your GoCart Order Has Been Shipped";
        } else if (status === "delivered") {
            message = `Dear ${order.user.name},\n\nYour order #${order._id} has been delivered!\n\nWe hope you love your new sneakers. If you have any issues, please contact our support.\n\nThank you for shopping with GoCart!\n\nBest regards,\nGoCart Team`;
            subject = "Your GoCart Order Has Been Delivered";
        }

        // Fire and forget email
        const sendEmail = require("../utils/sendEmail");
        sendEmail(order.user.email, subject, message);

        res.status(200).json({
            message: "Order status updated successfully",
            order,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===================== UPDATE PRODUCT =====================

const updateAdminProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;
        const image = req.file;
        let imageUrl = "";
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        product.category = category || product.category;
        product.stock = stock || product.stock;

        if (image) {
            // Delete old image from Cloudinary (upload new one)
            if (product.imageUrl) {
                const publicId = product.imageUrl.split("/").pop().split(".")[0];
                try {
                    await cloudinary.uploader.destroy(publicId);
                } catch (err) {
                    console.error("Cloudinary destroy failed:", err.message);
                }
            }
            const result = await cloudinary.uploader.upload(image.path);
            imageUrl = result.secure_url;
            product.imageUrl = imageUrl;
        }

        await product.save();
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===================== DELETE PRODUCT =====================

const deleteAdminProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete image from Cloudinary
        if (product.imageUrl) {
            const publicId = product.imageUrl.split("/").pop().split(".")[0];
            try {
                await cloudinary.uploader.destroy(publicId);
            } catch (err) {
                console.error("Cloudinary destroy failed:", err.message);
            }
        }

        await product.deleteOne();
        res.status(200).json({ message: "Product removed successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ===================== ALL USERS (ADMIN) =====================

const getAllAdminUsers = async (req, res) => {
    try {
        const { page = 1, limit = 10, role, verified, search } = req.query;
        const query = {};
        if (role && role !== "all") query.role = role;
        if (verified !== undefined) query.verified = verified === "true";
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(query)
            .select("-password -otp -otpExpiry")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await User.countDocuments(query);

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
            total,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getAllAdminProducts,
    getAllAdminOrders,
    updateOrderStatus,
    updateAdminProduct,
    deleteAdminProduct,
    getAllAdminUsers,
    getUserStats,
};

const Order = require("../routes/models/Order");
const User = require("../routes/models/User");
const Product = require("../routes/models/Product");

const getAdminStats = async (req, res) => {
    try {
        const orders = await Order.find();
        const totalOrders = await Order.countDocuments({});
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalProducts = await Product.countDocuments({});

        const totalIncome = orders.reduce((acc, order) => acc + order.totalAmount, 0);

        res.json({
            totalIncome,
            totalOrders,
            totalUsers,
            totalProducts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAdminStats };
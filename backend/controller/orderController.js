const Order = require("../routes/models/Order");
const sendEmail = require("../utils/sendEmail");

// create new order
const createOrder = async (req, res) => {
    const { Items, Address, paymentId, totalAmount } = req.body;
    try {
        const order = new Order({
            user: req.user._id,
            items: Items,
            address: Address,
            paymentId: paymentId,
            totalAmount: totalAmount
        });

        const createdOrder = await order.save();

        const message = `Dear ${req.user.name},\n\nThank you for your order! Your order has been successfully placed. Here are the details:\n\nOrder ID: ${order._id}\nTotal Amount: $${totalAmount}\n\nShipping Address: ${order.address.fullname}, ${order.address.street}, ${order.address.city}, ${order.address.postalCode}, ${order.address.country}\nWe will notify you once your order is shipped.\n\nBest regards,\nGoCart Team`;

        sendEmail(req.user.email, "Order Confirmation", message);

        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// my orders

const myOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).populate("items.product", "name price");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// get all orders (admin only)

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user", "name email").populate("items.product", "name price");
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// update order status (admin only)

const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = status;
        await order.save();
        res.status(200).json({ message: "Order status updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createOrder, getAllOrders, myOrders, updateOrderStatus };

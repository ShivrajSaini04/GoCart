const Razorpay = require("razorpay");
const crypto = require("crypto");
dotenv = require('dotenv').config();

const createOrder = async (req, res) => {
    try {
        const instance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: req.body.amount * 100, // amount in smallest currency unit
            currency: "INR",
            receipt: `receipt_order_${Math.random() * 1000}`,
        };

        const order = await instance.orders.create(options);
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyPayment = async (req, res) => {
    try{
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const shasum = crypto.createHash("sha256");
        shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = shasum.digest("hex");

        if (generated_signature === razorpay_signature) {
            res.status(200).json({ message: "Payment verified successfully" });
        } else {
            res.status(400).json({ error: "Invalid signature" });
        }
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrder, verifyPayment };

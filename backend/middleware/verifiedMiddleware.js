// blocks accounts that have not confirmed their email with the OTP sent at registration
const verified = (req, res, next) => {
    if (req.user && req.user.verified) {
        next();
    }
    else {
        res.status(403).json({ message: "Please verify your email before placing an order" });
    }
};

module.exports = { verified };

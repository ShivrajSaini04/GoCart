const User = require("../routes/models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

const OTP_VALID_FOR = 10 * 60 * 1000;

const generateOtp = () => Math.floor(10000 + Math.random() * 90000).toString();

// register user
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const otp = generateOtp();
        const otpExpiry = Date.now() + OTP_VALID_FOR;
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            // an account nobody ever verified is not usable, so let them start over
            if (existingUser.verified) {
                return res.status(400).json({ message: "User already exists" });
            }

            const salt = await bcrypt.genSalt(10);
            existingUser.name = name;
            existingUser.password = await bcrypt.hash(password, salt);
            existingUser.otp = otp;
            existingUser.otpExpiry = otpExpiry;
            await existingUser.save();
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(password, salt);
            await new User({ name, email, password: hashPassword, otp, otpExpiry }).save();
        }

        const message = `Welcome to GoCart! Thank you for registering. Your OTP for GoCart registration is: ${otp}`;

        await sendEmail(email, "Welcome to GoCart - Your OTP for Registration ", message);

        // no token yet: the account only becomes usable once the OTP is confirmed
        res.status(201).json({
            email,
            message: "Enter the code we emailed you to finish creating your account",
        });
    } catch (error) {
        res.status(500).json({ message: "Server error ! user not register" });
    }
}


// verify the OTP emailed at registration
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.verified) {
            return res.status(400).json({ message: "Account is already verified" });
        }
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Incorrect OTP" });
        }
        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP has expired, please request a new one" });
        }

        user.verified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            verified: user.verified,
            token: generateToken(user._id),
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}


// email a fresh OTP when the first one expired or never arrived
const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }
        if (user.verified) {
            return res.status(400).json({ message: "Account is already verified" });
        }

        const otp = generateOtp();
        user.otp = otp;
        user.otpExpiry = Date.now() + OTP_VALID_FOR;
        await user.save();

        const message = `Your new OTP for GoCart registration is: ${otp}`;

        await sendEmail(email, "GoCart - Your New Register OTP", message);

        res.json({ message: "A new OTP has been sent to your email" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
}


// login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            if (!user.verified) {
                return res.status(403).json({ message: "Please verify your email before logging in" });
            }

            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                verified: user.verified,
                token: generateToken(user._id),
            });

        }
        else {
            return res.status(400).json({ message: "User not found" });
        }
    }
    catch (err) {
        res.status(500).json({ message: "Server error" });
    }
}


// getuser
const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { registerUser, loginUser, getUser, verifyOtp, resendOtp };
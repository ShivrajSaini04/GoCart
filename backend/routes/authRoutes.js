const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUser, verifyOtp, resendOtp } = require("../controller/authcontroller");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

router.post("/register", registerUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", loginUser);
router.get("/user", protect, admin, getUser);

module.exports = router;

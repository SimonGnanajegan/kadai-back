const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middlewares/auth.middleware");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);

// New Routes
// New Routes
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/google", authController.googleSignIn);
// router.post("/send-otp", authController.sendOtp); // Optional, kept in controller but maybe not exposed if forgot-password handles it. 
// I'll comment it out or remove it to enforce usage of forgot-password for this flow.

module.exports = router;
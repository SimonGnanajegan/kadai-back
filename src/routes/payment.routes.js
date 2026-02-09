const express = require("express");
const router = express.Router();
const {
    createRazorpayOrder,
    verifyPayment,
    handleWebhook,
    processPayment,
} = require("../controllers/payment.controller");
const { protect } = require("../middlewares/auth.middleware");

// Razorpay endpoints
router.post("/create-order", protect, createRazorpayOrder);
router.post("/verify", protect, verifyPayment);
router.post("/webhook", handleWebhook); // No auth for webhooks

// Legacy mock payment endpoint
router.post("/process", protect, processPayment);

module.exports = router;

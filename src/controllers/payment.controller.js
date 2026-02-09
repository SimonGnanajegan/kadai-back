const Razorpay = require("razorpay");
const crypto = require("crypto");
const Order = require("../models/order.model");
const Cart = require("../models/cart.model");

// Lazy initialization of Razorpay to ensure env vars are loaded
const getRazorpayInstance = () => {
    return new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
};

/**
 * Create Razorpay Order
 * POST /api/payment/create-order
 */
exports.createRazorpayOrder = async (req, res) => {
    const { amount, currency = "INR", receipt, notes } = req.body;

    try {
        const razorpay = getRazorpayInstance();

        const options = {
            amount: Math.round(amount), // Razorpay expects amount in paise
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
            notes: notes || {},
        };

        const razorpayOrder = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            keyId: process.env.RAZORPAY_KEY_ID,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error creating Razorpay order",
            error: err.message,
        });
    }
};

/**
 * Verify Payment Signature
 * POST /api/payment/verify
 */
exports.verifyPayment = async (req, res) => {
    const {
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
        orderDetails,
    } = req.body;

    try {
        // Verify signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (generatedSignature !== razorpaySignature) {
            return res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }

        // Create order in database
        const orderType = orderDetails.orderType || "Delivery";

        // Validate address for delivery
        if (orderType === "Delivery" && !orderDetails.shippingAddress) {
            return res.status(400).json({
                success: false,
                message: "Shipping address is required for delivery orders",
            });
        }

        const order = await Order.create({
            user: req.user._id,
            items: orderDetails.items,
            shippingAddress: orderType === "Delivery" ? orderDetails.shippingAddress : undefined,
            paymentMethod: orderDetails.paymentMethod || "Card",
            totalAmount: Math.round((orderDetails.totalAmount + Number.EPSILON) * 100) / 100,
            paymentStatus: "Completed",
            orderStatus: "Processing",
            orderType,
            razorpayOrderId,
            razorpayPaymentId,
            razorpaySignature,
            transactionId: razorpayPaymentId,
        });

        // Clear user's cart
        await Cart.findOneAndDelete({ user: req.user._id });

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
            orderId: order._id,
            razorpayPaymentId,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Error verifying payment",
            error: err.message,
        });
    }
};

/**
 * Handle Razorpay Webhooks
 * POST /api/payment/webhook
 */
exports.handleWebhook = async (req, res) => {
    const webhookSignature = req.headers["x-razorpay-signature"];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    try {
        // Verify webhook signature (if webhook secret is configured)
        if (webhookSecret) {
            const generatedSignature = crypto
                .createHmac("sha256", webhookSecret)
                .update(JSON.stringify(req.body))
                .digest("hex");

            if (generatedSignature !== webhookSignature) {
                return res.status(400).json({ message: "Invalid signature" });
            }
        }

        const event = req.body.event;
        const paymentEntity = req.body.payload.payment.entity;

        // Handle different webhook events
        switch (event) {
            case "payment.authorized":
            case "payment.captured":
                // Update order status
                await Order.findOneAndUpdate(
                    { razorpayOrderId: paymentEntity.order_id },
                    {
                        paymentStatus: "Completed",
                        razorpayPaymentId: paymentEntity.id,
                    }
                );
                break;

            case "payment.failed":
                await Order.findOneAndUpdate(
                    { razorpayOrderId: paymentEntity.order_id },
                    { paymentStatus: "Failed" }
                );
                break;

            default:
                console.log(`Unhandled webhook event: ${event}`);
        }

        res.status(200).json({ status: "ok" });
    } catch (err) {
        console.error("Webhook error:", err);
        res.status(500).json({ message: "Webhook processing failed" });
    }
};

// Keep legacy mock payment for backward compatibility
exports.processPayment = async (req, res) => {
    const { orderId, paymentMethod, amount } = req.body;

    try {
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ message: "Order not found" });

        // Mock payment processing logic
        const isSuccess = true;

        if (isSuccess) {
            order.paymentStatus = "Completed";
            order.transactionId = `TXN_${Date.now()}`;
            await order.save();

            res.status(200).json({
                message: "Payment successful",
                transactionId: order.transactionId,
                orderId: order._id,
            });
        } else {
            order.paymentStatus = "Failed";
            await order.save();
            res.status(400).json({ message: "Payment failed" });
        }
    } catch (err) {
        res.status(500).json({ message: "Error processing payment", error: err.message });
    }
};

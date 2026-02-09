const express = require("express");
const router = express.Router();
const {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrdersAdmin,
    updateOrderStatus,
} = require("../controllers/order.controller");
const { protect, admin } = require("../middlewares/auth.middleware");

// User routes
router.post("/", protect, createOrder);
router.get("/", protect, getUserOrders);
router.get("/:id", protect, getOrderById);

// Admin routes
router.get("/admin/all", protect, admin, getAllOrdersAdmin);
router.put("/:id/status", protect, admin, updateOrderStatus);

module.exports = router;

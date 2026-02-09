const express = require("express");
const router = express.Router();
const {
    getDashboardStats,
    getRevenueChart,
    getTopProducts,
    getRecentOrders,
    getCategorySales,
} = require("../controllers/dashboard.controller");
const { protect, admin } = require("../middlewares/auth.middleware");

// All dashboard routes are protected and admin-only
router.get("/stats", protect, admin, getDashboardStats);
router.get("/chart", protect, admin, getRevenueChart);
router.get("/top-products", protect, admin, getTopProducts);
router.get("/recent-orders", protect, admin, getRecentOrders);
router.get("/category-sales", protect, admin, getCategorySales);

module.exports = router;

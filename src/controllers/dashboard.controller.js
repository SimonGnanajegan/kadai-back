const Order = require("../models/order.model");
const User = require("../models/user.model");
const Product = require("../models/product.model");

// Helper to get start of day/week/month
const getStartDate = (type) => {
    const now = new Date();
    if (type === "today") {
        return new Date(now.setHours(0, 0, 0, 0));
    }
    if (type === "week") {
        const firstDay = now.getDate() - now.getDay();
        return new Date(now.setDate(firstDay));
    }
    if (type === "month") {
        return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    return new Date(0); // Beginning of time
};

exports.getDashboardStats = async (req, res) => {
    try {
        const todayStart = getStartDate("today");
        const weekStart = getStartDate("week");
        const monthStart = getStartDate("month");

        // 1. Revenue & Orders Aggregation
        const revenueStats = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "Completed", // Only count completed payments
                    orderStatus: { $ne: "Cancelled" } // Exclude cancelled orders
                }
            },
            {
                $facet: {
                    today: [
                        { $match: { createdAt: { $gte: todayStart } } },
                        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
                    ],
                    week: [
                        { $match: { createdAt: { $gte: weekStart } } },
                        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
                    ],
                    month: [
                        { $match: { createdAt: { $gte: monthStart } } },
                        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
                    ],
                    total: [
                        { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }
                    ]
                }
            }
        ]);

        // 2. User Stats
        const totalUsers = await User.countDocuments({ role: "customer" });
        const newUsersMonth = await User.countDocuments({
            role: "customer",
            createdAt: { $gte: monthStart }
        });

        // 3. Order Status Breakdown (All orders, including pending/cancelled)
        const orderStatusStats = await Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 }
                }
            }
        ]);

        // 4. Low Stock Count (Stock < 10)
        const lowStockCount = await Product.countDocuments({ stock: { $lt: 10 } });

        // 5. Payment Method Distribution
        const paymentMethodStats = await Order.aggregate([
            {
                $match: { paymentStatus: "Completed" }
            },
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Format Response
        const stats = revenueStats[0];
        const formatStat = (statArray) => statArray[0] ? statArray[0].total : 0;
        const formatCount = (statArray) => statArray[0] ? statArray[0].count : 0;

        const orderStatusMap = orderStatusStats.reduce((acc, curr) => {
            acc[curr._id.toLowerCase()] = curr.count;
            return acc;
        }, {});

        const paymentMethodMap = paymentMethodStats.reduce((acc, curr) => {
            acc[curr._id.toLowerCase()] = curr.count;
            return acc;
        }, {});

        res.status(200).json({
            revenue: {
                today: formatStat(stats.today),
                week: formatStat(stats.week),
                month: formatStat(stats.month),
                total: formatStat(stats.total)
            },
            orders: {
                today: formatCount(stats.today),
                week: formatCount(stats.week),
                month: formatCount(stats.month),
                total: formatCount(stats.total)
            },
            users: {
                total: totalUsers,
                newThisMonth: newUsersMonth
            },
            orderStatus: {
                processing: orderStatusMap.processing || 0,
                shipped: orderStatusMap.shipped || 0,
                delivered: orderStatusMap.delivered || 0,
                cancelled: orderStatusMap.cancelled || 0
            },
            lowStockCount,
            paymentMethods: {
                card: paymentMethodMap.card || 0,
                upi: paymentMethodMap.upi || 0,
                cod: paymentMethodMap.cod || 0,
                razorpay: paymentMethodMap.razorpay || 0
            }
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching dashboard stats", error: err.message });
    }
};

exports.getRevenueChart = async (req, res) => {
    try {
        const days = parseInt(req.query.range) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const chartData = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    paymentStatus: "Completed",
                    orderStatus: { $ne: "Cancelled" }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json(chartData);
    } catch (err) {
        res.status(500).json({ message: "Error fetching chart data", error: err.message });
    }
};

exports.getTopProducts = async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "Completed",
                    orderStatus: { $ne: "Cancelled" }
                }
            },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    totalSold: { $sum: "$items.quantity" },
                    revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $project: {
                    _id: 1,
                    name: "$productDetails.name",
                    image: { $arrayElemAt: ["$productDetails.images", 0] },
                    totalSold: 1,
                    revenue: 1
                }
            }
        ]);

        res.status(200).json(topProducts);
    } catch (err) {
        res.status(500).json({ message: "Error fetching top products", error: err.message });
    }
};

exports.getRecentOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .select("user totalAmount orderStatus createdAt paymentStatus")
            .populate("user", "name email")
            .sort({ createdAt: -1 })
            .limit(10);

        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching recent orders", error: err.message });
    }
};

exports.getCategorySales = async (req, res) => {
    try {
        const categorySales = await Order.aggregate([
            {
                $match: {
                    paymentStatus: "Completed",
                    orderStatus: { $ne: "Cancelled" }
                }
            },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $group: {
                    _id: "$product.category",
                    totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
                    totalSold: { $sum: "$items.quantity" }
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $project: {
                    _id: 1,
                    name: "$category.name",
                    totalRevenue: 1,
                    totalSold: 1
                }
            },
            { $sort: { totalRevenue: -1 } }
        ]);

        res.status(200).json(categorySales);
    } catch (err) {
        res.status(500).json({ message: "Error fetching category sales", error: err.message });
    }
};

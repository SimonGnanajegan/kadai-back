const Order = require("../models/order.model");
const Cart = require("../models/cart.model");
const Product = require("../models/product.model");
const Settings = require("../models/settings.model");

exports.createOrder = async (req, res) => {
    const { shippingAddress, paymentMethod, items: reqBodyItems, orderType = "Delivery" } = req.body;

    try {
        // Validate shipping address for Delivery orders
        if (orderType === "Delivery" && !shippingAddress) {
            return res.status(400).json({ message: "Shipping address is required for delivery orders" });
        }

        // If items are not passed in req.body, try to get from cart
        let sourceItems = reqBodyItems;
        if (!sourceItems || sourceItems.length === 0) {
            const cart = await Cart.findOne({ user: req.user._id });
            if (!cart || cart.items.length === 0) {
                return res.status(400).json({ message: "No items to order" });
            }
            sourceItems = cart.items;
            // Optionally clear cart here or after payment success
            // await Cart.findOneAndDelete({ user: req.user._id });
        }

        // Calculate Total Amount & Tax
        let totalAmount = 0;
        let totalTax = 0;
        const settings = await Settings.findOne();
        const globalTaxRate = settings?.tax?.defaultTaxRate || 0;

        const orderItems = [];

        for (const item of sourceItems) {
            const product = await Product.findById(item.product);
            if (!product) return res.status(404).json({ message: `Product not found: ${item.product}` });

            // Calculate Tax
            // Use product specific tax if available, otherwise global tax
            const taxRate = product.taxRate !== undefined ? product.taxRate : globalTaxRate;
            const itemPrice = product.price * item.quantity;
            const itemTax = (itemPrice * taxRate) / 100;

            totalAmount += itemPrice + itemTax;
            totalTax += itemTax;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price,
                tax: itemTax // Optional: Store tax per item if needed in schema
            });
        }

        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            shippingAddress: orderType === "Delivery" ? shippingAddress : undefined,
            paymentMethod,
            totalAmount: Math.round(totalAmount), // Round off
            taxAmount: Math.round(totalTax), // Store total tax
            paymentStatus: "Pending",
            orderStatus: "Processing",
            orderType,
        });

        const populatedOrder = await order.populate([
            { path: "user", select: "name email mobile" },
            { path: "items.product", select: "name images price" }
        ]);

        // Emit socket event for admin notifications
        const io = req.app.get("io");
        if (io) {
            io.emit("new_order", populatedOrder);
        }

        res.status(201).json(populatedOrder);
    } catch (err) {
        res.status(500).json({ message: "Error creating order", error: err.message });
    }
};

exports.getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate("items.product", "name images price slug")
            .sort({ createdAt: -1 });
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: "Error fetching orders", error: err.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate("user", "name email mobile")
            .populate("items.product", "name images price slug");

        if (!order) return res.status(404).json({ message: "Order not found" });

        // Ensure user owns the order or is admin
        if (
            order.user._id.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(401).json({ message: "Not authorized" });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: "Error fetching order", error: err.message });
    }
};

// Admin: Get all orders with filters
exports.getAllOrdersAdmin = async (req, res) => {
    try {
        const { status, paymentStatus, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.orderStatus = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;

        const orders = await Order.find(query)
            .populate("user", "name email mobile")
            .populate("items.product", "name images price")
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Order.countDocuments(query);

        res.status(200).json({
            orders,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalOrders: count,
        });
    } catch (err) {
        res.status(500).json({ message: "Error fetching orders", error: err.message });
    }
};

// Admin: Update order status
exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderStatus, paymentStatus } = req.body;

        const updateData = {};
        if (orderStatus) updateData.orderStatus = orderStatus;
        if (paymentStatus) updateData.paymentStatus = paymentStatus;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        )
            .populate("user", "name email mobile")
            .populate("items.product", "name images price");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ message: "Error updating order", error: err.message });
    }
};

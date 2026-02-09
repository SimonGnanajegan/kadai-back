const Product = require("../models/product.model");
const Review = require("../models/review.model");
const Order = require("../models/order.model");
const Settings = require("../models/settings.model");

exports.createProductReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const productId = req.params.id;
        const userId = req.user._id;

        // 1. Global & Product Settings Check
        const settings = await Settings.findOne();
        if (settings && !settings.features.enableReviews) {
            return res.status(403).json({ message: "Reviews are currently disabled store-wide." });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        if (!product.enableReviews) {
            return res.status(403).json({ message: "Reviews are disabled for this product." });
        }

        // 2. Already Reviewed Check
        const existingReview = await Review.findOne({ product: productId, user: userId });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this product." });
        }

        // 3. Purchase Verification (Must be Delivered)
        const hasPurchased = await Order.findOne({
            user: userId,
            "items.product": productId,
            orderStatus: "Delivered"
        });

        if (!hasPurchased) {
            return res.status(403).json({ message: "You can only review products you have purchased and received." });
        }

        // 4. Create Review
        const review = await Review.create({
            user: userId,
            product: productId,
            rating: Number(rating),
            comment: comment || "", // Optional comment
            status: "APPROVED" // Auto-approve
        });

        // 5. Update Product Product Ratings (Aggregation)
        const stats = await Review.aggregate([
            { $match: { product: product._id, status: "APPROVED" } },
            {
                $group: {
                    _id: "$product",
                    numReviews: { $sum: 1 },
                    avgRating: { $avg: "$rating" }
                }
            }
        ]);

        if (stats.length > 0) {
            product.rating = stats[0].avgRating;
            product.numReviews = stats[0].numReviews;
        } else {
            product.rating = 0;
            product.numReviews = 0;
        }

        await product.save();

        res.status(201).json({ message: "Review added successfully", review });

    } catch (err) {
        console.error("Review Error:", err);
        res.status(500).json({ message: "Error adding review", error: err.message });
    }
};

exports.getProductReviews = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const productId = req.params.id;

        const reviews = await Review.find({ product: productId, status: "APPROVED" })
            .populate("user", "name") // Assuming User has 'name'
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const count = await Review.countDocuments({ product: productId, status: "APPROVED" });

        res.status(200).json({
            reviews,
            page: Number(page),
            pages: Math.ceil(count / limit),
            total: count
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching reviews", error: err.message });
    }
};

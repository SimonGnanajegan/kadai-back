const Product = require("../models/product.model");
const Category = require("../models/category.model");

exports.searchProducts = async (req, res) => {
    try {
        const { query, minPrice, maxPrice, category, sort } = req.query;

        // Search Products
        const productCriteria = {};
        if (query) {
            productCriteria.$or = [
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
            ];
        }

        if (category) {
            productCriteria.category = category;
        }

        if (minPrice || maxPrice) {
            productCriteria.price = {};
            if (minPrice) productCriteria.price.$gte = Number(minPrice);
            if (maxPrice) productCriteria.price.$lte = Number(maxPrice);
        }

        let sortOption = {};
        if (sort) {
            if (sort === "price_asc") sortOption.price = 1;
            if (sort === "price_desc") sortOption.price = -1;
            if (sort === "newest") sortOption.createdAt = -1;
        }

        const products = await Product.find(productCriteria)
            .populate("category", "name slug image")
            .sort(sortOption);

        // Search Categories
        let categories = [];
        if (query) {
            categories = await Category.find({
                $or: [
                    { name: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } },
                ],
            });
        }

        res.status(200).json({
            products,
            categories,
            totalProducts: products.length,
            totalCategories: categories.length,
        });
    } catch (err) {
        res.status(500).json({ message: "Error searching", error: err.message });
    }
};

exports.getPopularCuisines = async (req, res) => {
    try {
        // For now, returning all categories as popular cuisines
        // In a real app, this could be based on order count or a "popular" flag
        const cuisines = await Category.find().limit(10);
        res.status(200).json(cuisines);
    } catch (err) {
        res.status(500).json({ message: "Error fetching popular cuisines", error: err.message });
    }
};

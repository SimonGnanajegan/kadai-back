const Product = require("../models/product.model");

const { getProductTranslationPipeline } = require("../utils/aggregation.utils");

exports.getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            category,
            minPrice,
            maxPrice,
            sort,
            search,
        } = req.query;

        const lang = req.language || 'en';

        const query = {};

        if (category) {
            query.category = new mongoose.Types.ObjectId(category);
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // TODO: Search is limited to base fields or requires complex lookup-before-match. 
        // For now, keeping search simple on base fields (which might fail if name moved out). 
        // Ideally we migrate 'name' to 'en' translation but keep a copy or sync search index.
        // Assuming base 'name' still exists (from migration strategy: "cleanup later")
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                // { description: { $regex: search, $options: "i" } }, // description might be heavy
            ];
        }

        let sortOption = {};
        if (sort) {
            if (sort === "price_asc") sortOption.price = 1;
            if (sort === "price_desc") sortOption.price = -1;
            if (sort === "newest") sortOption.createdAt = -1;
        } else {
            sortOption.createdAt = -1;
        }

        // 1. Get Count (Standard Query)
        const count = await Product.countDocuments(query);

        // 2. Get Data (Aggregation)
        const pipeline = getProductTranslationPipeline(query, lang, sortOption, (page - 1) * limit, limit * 1);
        const products = await Product.aggregate(pipeline);

        res.status(200).json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalProducts: count,
        });
    } catch (err) {
        console.error("Aggregation Error:", err);
        res.status(500).json({ message: "Error fetching products", error: err.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const lang = req.language || 'en';
        const query = { _id: new mongoose.Types.ObjectId(req.params.id) };

        const pipeline = getProductTranslationPipeline(query, lang, {}, 0, 1);
        const products = await Product.aggregate(pipeline);

        if (!products.length) return res.status(404).json({ message: "Product not found" });

        res.status(200).json(products[0]);
    } catch (err) {
        res.status(500).json({ message: "Error fetching product", error: err.message });
    }
};

exports.getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const products = await Product.find({ category: categoryId }).populate(
            "category",
            "name slug"
        );
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: "Error fetching products", error: err.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { translations, ...productData } = req.body;
        const product = await Product.create(productData);

        if (translations && Array.isArray(translations) && translations.length > 0) {
            const ProductTranslation = require("../models/productTranslation.model");
            const translationDocs = translations.map(t => ({
                product: product._id,
                lang: t.lang,
                name: t.name,
                description: t.description,
                seoTitle: t.seoTitle,
                seoDescription: t.seoDescription
            }));
            await ProductTranslation.insertMany(translationDocs);
        }

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: "Error creating product", error: err.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { translations, ...productData } = req.body;
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            productData,
            { new: true, runValidators: true }
        ).populate("category", "name slug");

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (translations && Array.isArray(translations) && translations.length > 0) {
            const ProductTranslation = require("../models/productTranslation.model");
            // Process translations in parallel
            const updates = translations.map(t => {
                return ProductTranslation.findOneAndUpdate(
                    { product: product._id, lang: t.lang },
                    {
                        name: t.name,
                        description: t.description,
                        seoTitle: t.seoTitle,
                        seoDescription: t.seoDescription,
                        status: 'APPROVED'
                    },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            });
            await Promise.all(updates);
        }

        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: "Error updating product", error: err.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ message: "Product deleted successfully", product });
    } catch (err) {
        res.status(500).json({ message: "Error deleting product", error: err.message });
    }
};

// Translation Management
exports.upsertProductTranslation = async (req, res) => {
    try {
        const { id } = req.params; // Product ID
        const { lang, name, description, seoTitle, seoDescription, status } = req.body;

        if (!lang) return res.status(400).json({ message: "Language code is required" });

        const ProductTranslation = require("../models/productTranslation.model");

        const translation = await ProductTranslation.findOneAndUpdate(
            { product: id, lang },
            {
                name,
                description,
                seoTitle,
                seoDescription,
                status: status || 'APPROVED'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json(translation);
    } catch (err) {
        res.status(500).json({ message: "Error updating translation", error: err.message });
    }
};

exports.getProductTranslation = async (req, res) => {
    try {
        const { id, lang } = req.params;
        const ProductTranslation = require("../models/productTranslation.model");

        const translation = await ProductTranslation.findOne({ product: id, lang });

        if (!translation) {
            return res.status(404).json({ message: "Translation not found" });
        }

        res.status(200).json(translation);
    } catch (err) {
        res.status(500).json({ message: "Error fetching translation", error: err.message });
    }
};

exports.getProductsForAdmin = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search
        } = req.query;

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } }
            ];
        }

        const count = await Product.countDocuments(query);

        const products = await Product.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: (page - 1) * limit },
            { $limit: limit * 1 },
            {
                $lookup: {
                    from: "producttranslations",
                    localField: "_id",
                    foreignField: "product",
                    as: "translations"
                }
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } }
        ]);

        res.status(200).json({
            products,
            totalPages: Math.ceil(count / limit),
            currentPage: Number(page),
            totalProducts: count,
        });

    } catch (err) {
        res.status(500).json({ message: "Error fetching admin products", error: err.message });
    }
};

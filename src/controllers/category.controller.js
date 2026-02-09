const Category = require("../models/category.model");

const { getCategoryTranslationPipeline } = require("../utils/aggregation.utils");
const mongoose = require("mongoose");

exports.getAllCategories = async (req, res) => {
    try {
        const lang = req.language || 'en';
        const pipeline = getCategoryTranslationPipeline({}, lang);
        const categories = await Category.aggregate(pipeline);
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: "Error fetching categories", error: err.message });
    }
};

exports.createCategory = async (req, res) => {
    const { translations, ...categoryData } = req.body;

    try {
        const category = await Category.create(categoryData);

        if (translations && Array.isArray(translations) && translations.length > 0) {
            const CategoryTranslation = require("../models/categoryTranslation.model");
            const translationDocs = translations.map(t => ({
                category: category._id,
                lang: t.lang,
                name: t.name,
                description: t.description
            }));
            await CategoryTranslation.insertMany(translationDocs);
        }

        res.status(201).json(category);
    } catch (err) {
        res.status(500).json({ message: "Error creating category", error: err.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const lang = req.language || 'en';
        const query = { _id: new mongoose.Types.ObjectId(req.params.id) };
        const pipeline = getCategoryTranslationPipeline(query, lang);

        const categories = await Category.aggregate(pipeline);

        if (!categories.length) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(categories[0]);
    } catch (err) {
        res.status(500).json({ message: "Error fetching category", error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { translations, ...categoryData } = req.body;
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            categoryData,
            { new: true, runValidators: true }
        );

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

        if (translations && Array.isArray(translations) && translations.length > 0) {
            const CategoryTranslation = require("../models/categoryTranslation.model");
            const updates = translations.map(t => {
                return CategoryTranslation.findOneAndUpdate(
                    { category: category._id, lang: t.lang },
                    { name: t.name, description: t.description },
                    { upsert: true, new: true, setDefaultsOnInsert: true }
                );
            });
            await Promise.all(updates);
        }

        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ message: "Error updating category", error: err.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);

        if (!category) {
            return res.status(404).json({ message: "Category not found" });
        }

    } catch (err) {
        res.status(500).json({ message: "Error deleting category", error: err.message });
    }
};

exports.upsertCategoryTranslation = async (req, res) => {
    try {
        const { id } = req.params;
        const { lang, name, description } = req.body;

        if (!lang) return res.status(400).json({ message: "Language code is required" });

        const CategoryTranslation = require("../models/categoryTranslation.model");

        const translation = await CategoryTranslation.findOneAndUpdate(
            { category: id, lang },
            { name, description },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json(translation);
    } catch (err) {
        res.status(500).json({ message: "Error updating translation", error: err.message });
    }
};

exports.getCategoryTranslation = async (req, res) => {
    try {
        const { id, lang } = req.params;
        const CategoryTranslation = require("../models/categoryTranslation.model");

        const translation = await CategoryTranslation.findOne({ category: id, lang });

        if (!translation) {
            return res.status(404).json({ message: "Translation not found" });
        }

        res.status(200).json(translation);
    } catch (err) {
        res.status(500).json({ message: "Error fetching translation", error: err.message });
    }
};

exports.getCategoriesForAdmin = async (req, res) => {
    try {
        const categories = await Category.aggregate([
            {
                $lookup: {
                    from: "categorytranslations",
                    localField: "_id",
                    foreignField: "category",
                    as: "translations"
                }
            }
        ]);
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ message: "Error fetching admin categories", error: err.message });
    }
};

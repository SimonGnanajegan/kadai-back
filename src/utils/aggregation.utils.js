const mongoose = require('mongoose');

/**
 * Builds an aggregation pipeline to fetch localized product data.
 * @param {Object} query - Mongoose match query (e.g. { price: { $gt: 100 } })
 * @param {string} lang - The requested language code (e.g. 'ta')
 * @param {Object} sort - The sort object (e.g. { price: -1 })
 * @param {number} skip - Pagination skip
 * @param {number} limit - Pagination limit
 * @returns {Array} - Aggregation pipeline
 */
const getProductTranslationPipeline = (query, lang, sort = { createdAt: -1 }, skip = 0, limit = 10) => {
    const pipeline = [
        { $match: query }
    ];

    if (Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort });
    }

    pipeline.push(
        { $skip: skip },
        { $limit: limit },
        // Lookup Translations
        {
            $lookup: {
                from: "producttranslations", // collection name lowercase plural
                let: { pid: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$product", "$$pid"] },
                                    { $in: ["$lang", [lang, "en"]] } // Fetch requested + English fallback
                                ]
                            }
                        }
                    },
                    // Sort so requested lang comes first
                    {
                        $addFields: {
                            sortOrder: { $cond: [{ $eq: ["$lang", lang] }, 0, 1] }
                        }
                    },
                    { $sort: { sortOrder: 1 } },
                    { $limit: 1 } // Take the best match
                ],
                as: "translation"
            }
        },
        // Unwind to get object (preserveNullAndEmptyArrays: true to keep product even if no translation)
        {
            $unwind: { path: "$translation", preserveNullAndEmptyArrays: true }
        },
        // Populate Category (if needed, mimicking existing populate)
        {
            $lookup: {
                from: "categories",
                localField: "category",
                foreignField: "_id",
                as: "category"
            }
        },
        { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
        // Project final shape
        {
            $project: {
                _id: 1,
                price: 1,
                slug: 1,
                discountPrice: 1,
                images: 1,
                stock: 1,
                rating: 1,
                numReviews: 1,
                enableReviews: 1,
                isFeatured: 1,
                category: { _id: 1, name: 1, slug: 1 },
                // Overwrite with Translation
                name: { $ifNull: ["$translation.name", "$name"] },
                description: { $ifNull: ["$translation.description", "$description"] },
                seoTitle: "$translation.seoTitle",
                seoDescription: "$translation.seoDescription"
            }
        }
    );
    return pipeline;
};

const getCategoryTranslationPipeline = (query, lang) => {
    return [
        { $match: query },
        {
            $lookup: {
                from: "categorytranslations",
                let: { cid: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ["$category", "$$cid"] },
                                    { $in: ["$lang", [lang, "en"]] }
                                ]
                            }
                        }
                    },
                    {
                        $addFields: {
                            sortOrder: { $cond: [{ $eq: ["$lang", lang] }, 0, 1] }
                        }
                    },
                    { $sort: { sortOrder: 1 } },
                    { $limit: 1 }
                ],
                as: "translation"
            }
        },
        { $unwind: { path: "$translation", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                image: 1,
                slug: 1,
                name: { $ifNull: ["$translation.name", "$name"] },
                description: { $ifNull: ["$translation.description", "$description"] }
            }
        }
    ];
};

module.exports = { getProductTranslationPipeline, getCategoryTranslationPipeline };

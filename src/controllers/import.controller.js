const Product = require('../models/product.model');
const Category = require('../models/category.model');
const { parseCSV } = require('../utils/csvParser');

exports.importProducts = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'string') {
            return res.status(400).json({ message: "Invalid CSV data. Please send as text/plain or text/csv body." });
        }

        const rawData = parseCSV(req.body);
        const stats = { created: 0, updated: 0, skipped: 0, failed: 0 };
        const errors = [];

        // Helper to normalize keys (e.g. "Discount Price" -> "discountPrice")
        const normalizeKey = (key) => {
            return key.trim().toLowerCase()
                .replace(/\s+/g, '') // Remove all spaces
                .replace(/isfeatured/, 'isFeatured') // Re-case known camels
                .replace(/discountprice/, 'discountPrice')
                .replace(/taxrate/, 'taxRate')
                .replace(/numreviews/, 'numReviews')
                .replace(/imageurl/, 'images'); // Map "Image URL" -> "images" (array)
        };

        const data = rawData.map(row => {
            const newRow = {};
            for (const key of Object.keys(row)) {
                newRow[normalizeKey(key)] = row[key];
            }
            return newRow;
        });

        for (const row of data) {
            try {
                if (!row.slug || !row.name) {
                    errors.push(`Missing slug or name: ${JSON.stringify(row)}`);
                    stats.failed++;
                    continue;
                }

                // Handle Category Lookup
                if (row.category) {
                    // If it's not an ObjectId, try to find it
                    const mongoose = require('mongoose');
                    if (!mongoose.Types.ObjectId.isValid(row.category)) {
                        const categoryDoc = await Category.findOne({
                            $or: [
                                { name: { $regex: new RegExp(`^${row.category}$`, 'i') } },
                                { slug: { $regex: new RegExp(`^${row.category}$`, 'i') } }
                            ]
                        });

                        if (categoryDoc) {
                            row.category = categoryDoc._id;
                        } else {
                            // Fallback: If we can't find it, we can't import this product properly.
                            // Or we create a dummy category? Better to fail or warn.
                            // For now, let's fail this row.
                            throw new Error(`Category not found: ${row.category}`);
                        }
                    }
                }

                // Handle Images (Convert single string to array if needed)
                if (row.images && typeof row.images === 'string') {
                    row.images = [row.images];
                }

                // Handle Booleans
                if (row.isFeatured) {
                    row.isFeatured = typeof row.isFeatured === 'string'
                        ? (row.isFeatured.toLowerCase() === 'yes' || row.isFeatured.toLowerCase() === 'true')
                        : !!row.isFeatured;
                }

                const existing = await Product.findOne({ slug: row.slug });

                if (existing) {
                    // Update Logic
                    let hasChanges = false;
                    const updatePayload = {};

                    for (const key of Object.keys(row)) {
                        if (['id', '_id', 'createdat', 'updatedat', 'v', 'variants', 'tamilname', 'tamildescription'].includes(key.toLowerCase())) continue;

                        // Skip if key doesn't exist in schema (basic check)
                        // Actually, Mongoose will ignore unknown fields if strict: true (default)

                        let newValue = row[key];
                        let oldValue = existing[key];

                        // Special handling for Arrays (Images)
                        if (Array.isArray(newValue)) {
                            if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
                                updatePayload[key] = newValue;
                                hasChanges = true;
                            }
                            continue;
                        }

                        // Special handling for ObjectIds
                        if (key === 'category' && oldValue) {
                            if (String(newValue) !== String(oldValue)) {
                                updatePayload[key] = newValue;
                                hasChanges = true;
                            }
                            continue;
                        }

                        if (String(newValue) !== String(oldValue)) {
                            updatePayload[key] = newValue;
                            hasChanges = true;
                        }
                    }

                    if (hasChanges) {
                        console.log(`[Import] Updating ${row.slug}:`, updatePayload);
                        const result = await Product.updateOne({ _id: existing._id }, { $set: updatePayload }, { runValidators: true });
                        if (result.modifiedCount > 0) {
                            stats.updated++;
                        } else {
                            console.log(`[Import] No document modified for ${row.slug} (Mongoose internal check)`);
                            stats.skipped++;
                        }
                    } else {
                        // console.log(`[Import] No changes detected for ${row.slug}`);
                        stats.skipped++;
                    }
                } else {
                    await Product.create(row);
                    stats.created++;
                }

            } catch (err) {
                console.error(`[Import] Error on ${row.slug}:`, err);
                stats.failed++;
                errors.push(`Error processing slug ${row.slug}: ${err.message}`);
            }
        }

        console.log("[Import] Stats:", stats);
        res.status(200).json({ message: "Import completed", stats, errors });

    } catch (err) {
        res.status(500).json({ message: "Import failed", error: err.message });
    }
};

exports.importCategories = async (req, res) => {
    try {
        if (!req.body || typeof req.body !== 'string') {
            return res.status(400).json({ message: "Invalid CSV data. Please send as text/plain or text/csv body." });
        }

        const data = parseCSV(req.body);
        const stats = { created: 0, updated: 0, skipped: 0, failed: 0 };
        const errors = [];

        for (const row of data) {
            try {
                if (!row.slug || !row.name) {
                    errors.push(`Missing slug or name: ${JSON.stringify(row)}`);
                    stats.failed++;
                    continue;
                }

                const existing = await Category.findOne({ slug: row.slug });

                if (existing) {
                    let hasChanges = false;
                    const updatePayload = {};

                    for (const key of Object.keys(row)) {
                        if (key === '_id' || key === 'createdAt' || key === 'updatedAt') continue;
                        if (String(row[key]) !== String(existing[key])) {
                            updatePayload[key] = row[key];
                            hasChanges = true;
                        }
                    }

                    if (hasChanges) {
                        await Category.updateOne({ _id: existing._id }, updatePayload, { runValidators: true });
                        stats.updated++;
                    } else {
                        stats.skipped++;
                    }
                } else {
                    await Category.create(row);
                    stats.created++;
                }

            } catch (err) {
                stats.failed++;
                errors.push(`Error processing slug ${row.slug}: ${err.message}`);
            }
        }

        res.status(200).json({ message: "Import completed", stats, errors });

    } catch (err) {
        res.status(500).json({ message: "Import failed", error: err.message });
    }
};

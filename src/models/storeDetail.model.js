const mongoose = require('mongoose');

const BusinessHourSchema = new mongoose.Schema({
    day: { type: String, required: true }, // e.g., "Monday"
    open: { type: String, required: true }, // "09:00"
    close: { type: String, required: true } // "18:00"
});

const HolidaySchema = new mongoose.Schema({
    date: { type: Date, required: true },
    description: { type: String }
});

const StoreDetailSchema = new mongoose.Schema({
    basicInfo: {
        name: { type: String, required: true },
        tagline: String,
        description: String,
        logoUrl: String
    },
    location: {
        address: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number
        },
        mapUrl: String,
        deliveryRadiusKm: { type: Number, default: 5 }
    },
    contact: {
        phone: { type: String, required: true },
        email: { type: String, required: true },
        socialLinks: [{
            platform: { type: String, enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'website'] },
            url: String
        }]
    },
    operations: {
        isOpenNow: { type: Boolean, default: true }, // Manual override
        businessHours: [{
            day: { type: String, default: 'Everyday' },
            open: { type: String, required: true }, // "09:00"
            close: { type: String, required: true } // "21:00"
        }],
        holidays: [{
            date: { type: Date, required: true },
            name: { type: String, required: true },
            isClosed: { type: Boolean, default: true }
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('StoreDetail', StoreDetailSchema);

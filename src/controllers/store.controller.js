const StoreDetail = require('../models/storeDetail.model');

// Helper to get day name
const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
};

// Helper to parse time string "HH:mm" to minutes for comparison
const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};

// Public endpoint: get store details
exports.getStoreDetails = async (req, res) => {
    try {
        let store = await StoreDetail.findOne().lean();

        if (!store) {
            // Return empty structure if not found (or handle as 404, but empty structure often better for UI init)
            return res.status(404).json({ message: 'Store details not found' });
        }

        // --- Calculate Derived Fields ---
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // 1. Next Holiday
        let nextHoliday = null;
        if (store.operations && store.operations.holidays) {
            // Filter future holidays or today, sort by date
            const upcomingHolidays = store.operations.holidays
                .filter(h => new Date(h.date) >= new Date(todayStr))
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            if (upcomingHolidays.length > 0) {
                nextHoliday = upcomingHolidays[0];
            }
        }

        // 2. Is Open Now
        let isOpenNow = false;

        // Check manual override first
        if (store.operations && store.operations.isOpenNow === false) {
            isOpenNow = false;
        } else {
            // Check if today is a holiday
            const isHolidayToday = store.operations?.holidays?.some(h =>
                new Date(h.date).toISOString().split('T')[0] === todayStr && h.isClosed
            );

            if (isHolidayToday) {
                isOpenNow = false;
            } else {
                // Check business hours
                const currentDay = getDayName(now);
                const currentMinutes = now.getHours() * 60 + now.getMinutes();

                const todayHours = store.operations?.businessHours?.find(bh => bh.day === currentDay || bh.day === 'Everyday');

                if (todayHours) {
                    const openMinutes = parseTime(todayHours.open);
                    const closeMinutes = parseTime(todayHours.close);

                    if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
                        isOpenNow = true;
                    }
                }
            }
        }

        // Inject calculated fields into response
        if (!store.operations) store.operations = {};
        store.operations.isOpenNow = isOpenNow;
        store.operations.nextHoliday = nextHoliday;

        res.json({ data: store });
    } catch (err) {
        console.error("Error fetching store details:", err);
        res.status(500).json({ message: 'Error fetching store details', error: err.message });
    }
};

// Admin endpoint: create or update store details (upsert)
exports.upsertStoreDetails = async (req, res) => {
    try {
        const payload = req.body;
        // Payload is expected to match the new StoreProfile structure

        const store = await StoreDetail.findOneAndUpdate({}, payload, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true
        });

        res.json({ message: 'Store details saved', data: store });
    } catch (err) {
        console.error("Error saving store details:", err);
        res.status(500).json({ message: 'Error saving store details', error: err.message });
    }
};

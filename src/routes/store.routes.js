const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

// Public endpoint
router.get('/store', storeController.getStoreDetails);

// Admin endpoints (protected, admin only)
router.post('/admin/store', protect, admin, storeController.upsertStoreDetails);

module.exports = router;

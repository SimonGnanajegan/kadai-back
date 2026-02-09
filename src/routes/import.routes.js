const express = require('express');
const router = express.Router();
const { importProducts, importCategories } = require('../controllers/import.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

// Routes
// Note: Frontend must send Content-Type: text/csv or text/plain
router.post('/products/import', protect, admin, importProducts);
router.post('/categories/import', protect, admin, importCategories);

module.exports = router;

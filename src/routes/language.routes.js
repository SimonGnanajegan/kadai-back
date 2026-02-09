const express = require('express');
const router = express.Router();
const { getAllLanguages, createLanguage, updateLanguage, deleteLanguage } = require('../controllers/language.controller');
const { protect, admin } = require('../middlewares/auth.middleware');

// Public to fetch languages? Or Admin? Usually public for language switcher.
router.get('/', getAllLanguages);

// Admin only management
router.post('/', protect, admin, createLanguage);
router.put('/:id', protect, admin, updateLanguage);
router.delete('/:id', protect, admin, deleteLanguage);

module.exports = router;

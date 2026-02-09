const express = require("express");
const router = express.Router();
const { searchProducts, getPopularCuisines } = require("../controllers/search.controller");

router.get("/products", searchProducts);
router.get("/cuisines", getPopularCuisines);

module.exports = router;

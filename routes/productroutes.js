const express = require("express");

const productController = require("../controllers/productcontroller");

const router = express.Router();

router.get("/",productController.list);

module.exports = router;
const express = require("express");

const productController = require("../controllers/productcontroller");
const { authrequired } = require("../middleware/authmiddleware");


const router = express.Router();

router.get("/", authrequired, productController.list);


module.exports = router;
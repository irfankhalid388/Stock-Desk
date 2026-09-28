const express = require("express");
const dashboardController = require("../controllers/dashboardcontroller");
const { authrequired } = require("../middleware/authmiddleware");
const router = express.Router();

router.get("/", authrequired, dashboardController.overview);

module.exports = router;
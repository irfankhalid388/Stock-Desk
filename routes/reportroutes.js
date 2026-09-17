const express = require("express");
const dashboardController = require("../controllers/dashboardcontroller");
const { authrequired } = require("../middleware/authmiddleware");
const {rolerequired} = require("../middleware/rolerequired");
const router = express.Router();

router.get("/summary", authrequired, rolerequired("admin"), dashboardController.summary);
router.get("/low-stock", authrequired, dashboardController.getlowstock);
router.get("/sales_per_staff",authrequired,rolerequired("admin"),dashboardController.gettopemployees)

module.exports = router;
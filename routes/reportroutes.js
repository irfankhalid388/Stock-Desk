const express = require("express");
const report = require("../controllers/report");
const { authrequired } = require("../middleware/authmiddleware");
const {rolerequired} = require("../middleware/rolerequired");
const router = express.Router();

router.get("/summary", authrequired, rolerequired("admin"), report.summary);
router.get("/low-stock", authrequired, report.getlowstock);
router.get("/sales_per_staff",authrequired,rolerequired("admin"),report.gettopemployees)

module.exports = router;
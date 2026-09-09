const express = require("express");
const invoiceController = require("../controllers/invoicecontroller");
const { authrequired } = require("../middleware/authmiddleware");
const {rolerequired} = require("../middleware/rolerequired");
const router = express.Router();

router.put("/:id/status", authrequired, rolerequired("admin"), invoiceController.updatestatus);

module.exports = router;
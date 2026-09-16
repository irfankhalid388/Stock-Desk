const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoicecontroller');
const { authrequired } = require("../middleware/authmiddleware");
const {rolerequired}=require("../middleware/rolerequired")
router.post('/', authrequired,rolerequired("admin","staff"), invoiceController.create);
router.put('/:id/status', authrequired, rolerequired('admin'), invoiceController.updateStatus);
module.exports = router;
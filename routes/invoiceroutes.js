const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoicecontroller');
const { authrequired } = require("../middleware/authmiddleware");
const {rolerequired}=require("../middleware/rolerequired");
const { invoiceRules, validate } = require('../middleware/validate');
router.post('/', authrequired,rolerequired("admin","staff"),invoiceRules,validate, invoiceController.create);
router.put('/:id/status', authrequired, rolerequired('admin'), invoiceController.updateStatus);
router.get("/:id",authrequired,rolerequired("admin","staff"),invoiceController.getOne)
router.get('/',authrequired,rolerequired('admin','staff'),invoiceController.getAll)
router.put('/:id/pay', authrequired, rolerequired('admin', 'staff'), invoiceController.markPaid);
module.exports = router;
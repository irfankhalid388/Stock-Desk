// controllers/invoiceController.js
const { cancelInvoice } = require('../models/invoicemodel');
const { createwithitems } = require('../models/invoicemodel');

async function create(req, res, next) {
  try {
    const { customerId, items, discount, tax } = req.body;
    const userId = req.user.id;

    const invoice = await createwithitems({
      customerId,
      userId,
      items,
      discount,
      tax,
    });

    res.status(201).json(invoice);
  } catch (err) {
    next(err); 
  }
}

// CANCLEINVOICE
async function updateStatus(req, res, next) {
  try {
    const invoiceId = req.params.id;
    const userId = req.user.id;

    const result = await cancelInvoice(invoiceId, userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}


module.exports = { create,updateStatus};
// controllers/invoiceController.js
const { createwithitems,cancelInvoice,search, list,paidinvoice } = require('../models/invoicemodel');
async function create(req, res, next) {
  try {
    const { customerId, items, discount, tax } = req.body;
    const userId = req.user.id;

    // Convert productId (camelCase, from validation) to productid (lowercase, used by model)
    const normalizedItems = items.map((i) => ({
      productid: i.productId,
      quantity: i.quantity,
    }));

    const invoice = await createwithitems({
      customerId,
      userId,
      items: normalizedItems,
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
// search//////////////////////////////////////////////////////
async function getOne(req,res,next){
  try{
      const invoice=await search(req.params.id)
      if(!invoice){
         return res.status(404).json({ error: "INVOICE_NOT_FOUND" });
      }
       res.status(200).json(invoice);
  }
  catch(err){
next(err)
}
}
// LIST///////////////////////////////////////////////////
async function getAll(req,res,next){
  try{
  const page=parseInt(req.query.page)||1
  const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const status = req.query.status || "";
    const result = await list({page,limit,search,status})
    res.status(200).json(result)

}
catch(err){
next(err)
}
}
// paid////////////////////////////////////////////////////////////////////// invoice
async function markPaid(req, res, next) {
  try {
    const result = await paidinvoice(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
module.exports = { create,updateStatus,getOne,getAll,markPaid};
const productModel = require("../models/productmodel");

async function test(req, res, next) {
  try {
    res.render('layouts/main', {
      title: 'Test',
      view: 'test'
    });
  } catch (err) {
    next(err);
  }
}

async function productsList(req, res, next) {
  try {
    res.render('layouts/main', {
      title: 'Products',
      view: 'products/list'
    });
  } catch (err) {
    next(err);
  }
}

async function productForm(req, res, next) {
  try {
    let product = null;

    if (req.params.id) {
      product = await productModel.showall(req.params.id);
      if (!product) {
        return res.status(404).send('Product not found');
      }
    }

    res.render('layouts/main', {
      title: product ? 'Edit Product' : 'Add Product',
      view: 'products/form',
      product
    });
  } catch (err) {
    next(err);
  }
}
async function customerlist(req,res,next) {
  try{
   res.render('layouts/main',{
    title:"customers",
    view:'customers/list'
   })
  }
  catch(err){
   next(err)
  }
}
   function customerForm(req, res) {
    try{
     res.render("layouts/main", {
       title: req.params.id ? "Edit Customer" : "Add Customer",
       view: "customers/form",
       customer: req.customer || null,   // however you're loading it — see below
     });
   }
   catch(err){
    next(err)
   }
  }
  function customerSummary(req, res) {
  res.render("layouts/main", {
    title: "Customer Summary",
    view: "customers/customersummary",
  });
}
function invoicesList(req, res) {
  res.render("layouts/main", {
    title: "Invoices",
    view: "invoices/list",
  });
}

function invoiceDetail(req, res) {
  res.render("layouts/main", {
    title: "Invoice Detail",
    view: "invoices/detail",
  });
}


module.exports = { test, productsList, productForm,customerlist,customerForm,customerSummary,invoiceDetail,invoicesList };
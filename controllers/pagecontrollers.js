const productModel = require("../models/productmodel");
const userModel = require("../models/usermodel");
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


function invoiceForm(req, res) {
  res.render("layouts/main", {
    title: "Create Invoice",
    view: "invoices/invoice_form",
  });
}


function dashboardPage(req, res) {
  res.render("layouts/main", { title: "Dashboard", view: "dashboard/dashboard" });
}


async function usersPage(req, res, next) {
  try {
    const users = await userModel.getallusers();

    res.render("layouts/main", {
      title:"staff",
      view: "staff/staff",
      users
    });
  } catch (err) {
    next(err);
  }
}

function usersList(req, res) {
  res.render("layouts/main", {
    title: "Users",
    view: "users/list",
  });
}

async function userForm(req, res, next) {
  try {
    let targetUser = null;

    if (req.params.id) {
      targetUser = await userModel.findById(req.params.id);
      if (!targetUser) {
        return res.status(404).send("User not found");
      }
    }

    res.render("layouts/main", {
      title: targetUser ? "Edit User" : "Add User",
      view: "users/form",
      targetUser,
    });
  } catch (err) {
    next(err);
  }
}
function reportsPage(req, res) {
  res.render("layouts/main", {
    title: "Reports",
    view: "reports/index",
  });
}

module.exports = {reportsPage,usersPage, test, productsList, productForm,customerlist,customerForm,customerSummary,invoiceDetail,invoicesList,invoiceForm,dashboardPage,userForm,usersList };
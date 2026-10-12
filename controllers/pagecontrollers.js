const productModel = require("../models/productmodel");
const userModel = require("../models/usermodel");
const customerModel = require("../models/customermodel");

async function productsList(req, res, next) {
  try {
    res.render('layouts/main', {
      title: 'Products',
      view: 'products/list',
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
        return notFound(res, "Product not found.");
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

async function customerlist(req, res, next) {
  try {
    res.render('layouts/main', {
      title: "customers",
      view: 'customers/list'
    });
  } catch (err) {
    next(err);
  }
}

// edit mode mein customer DB se load hota hai
async function customerForm(req, res, next) {
  try {
    let customer = null;

    if (req.params.id) {
      customer = await customerModel.showall(req.params.id);
      if (!customer) {
        return notFound(res, "Customer not found.");
      }
    }

    res.render("layouts/main", {
      title: customer ? "Edit Customer" : "Add Customer",
      view: "customers/form",
      customer,
    });
  } catch (err) {
    next(err);
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

function usersList(req, res) {
  const flash = req.query.saved
    ? { type: "success", message: "User saved." }
    : null;

  res.render("layouts/main", {
    title: "Users",
    view: "users/list",
    flash,
  });
}

async function userForm(req, res, next) {
  try {
    let targetUser = null;

    if (req.params.id) {
      targetUser = await userModel.findById(req.params.id);
      if (!targetUser) {
        return notFound(res, "User not found.");
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

function notFound(res, message) {
  return res.status(404).render("layouts/main", {
    title: "Not found",
    view: "errors/notfound",
    flash: { type: "error", message },
  });
}


function forgotPage(req, res) { res.render("auth/forgot") }
function resetPage(req, res)  { res.render("auth/reset") }


function profilePage(req, res) {
  res.render("layouts/main", {
    title: "My Profile",
    view: "profiles/profiles",
  })
}
module.exports = {
  profilePage,
  notFound,
  reportsPage,
  productsList,
  productForm,
  customerlist,
  customerForm,
  customerSummary,
  invoiceDetail,
  invoicesList,
  invoiceForm,
  dashboardPage,
  userForm,
  usersList,
  forgotPage,
  resetPage
};
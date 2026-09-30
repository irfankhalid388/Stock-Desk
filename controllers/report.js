const reportModel = require("../models/reportmodel");
const productModel = require("../models/productmodel");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function isRealDate(s) {
  if (!DATE_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}


function pad(n) {
  return String(n).padStart(2, "0");
}

function localDate(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// default: is mahine ki 1 tareekh se aaj tak
function getRange(query) {
  const now = new Date();
  const from = query.from || `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
  const to = query.to || localDate(now);
  if (!DATE_RE.test(from) || !DATE_RE.test(to) || from > to) return null;
  return { from: `${from} 00:00:00`, to: `${to} 23:59:59` };
}

// GET SUMMARY
async function summary(req, res, next) {
  try {
    const range = getRange(req.query);
    if (!range) {
      return res.status(422).json({ error:  "from and to must be real YYYY-MM-DD dates, and from must not be after to"  });
    }
    const result = await reportModel.getreport(range.from, range.to);
    const topProducts = await reportModel.gettopproducts(range.from, range.to);
    res.status(200).json({ ...result, top_products: topProducts });
  } catch (err) {
    next(err);
  }
}

// GET TOP EMPLOYEES
async function gettopemployees(req, res, next) {
  try {
    const range = getRange(req.query);
    if (!range) {
      return res.status(422).json({ error:  "from and to must be real YYYY-MM-DD dates, and from must not be after to"  });
    }
    const result = await reportModel.saleperperson(range.from, range.to);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

// GET LOW STOCK
async function getlowstock(req, res, next) {
  try {
    const result = await productModel.findlowsstock();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { summary, getlowstock, gettopemployees };
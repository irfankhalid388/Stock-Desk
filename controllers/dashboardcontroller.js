const dashboardModel = require("../models/dashboardmodel");

// GET /api/dashboard
async function overview(req, res, next) {
  try {
    // 1) counts sab ke liye
    const counts = await dashboardModel.getcounts();

    // 2) staff ho to yahin ruk jao, sales unhein bheji hi nahi jati
    if (req.user.role !== "admin") {
      return res.status(200).json({ counts });
    }

    // 3) admin ke liye baqi data, aik ke baad aik
    const today = await dashboardModel.getsalestoday();
    const month = await dashboardModel.getsalesmonth();
    const unpaid = await dashboardModel.getunpaidamount();
    const top_products = await dashboardModel.gettopproducts();

    // 4) sab kuch JSON mein bhej do
    res.status(200).json({
      counts,
      sales: { today, month, unpaid },
      top_products,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { overview };
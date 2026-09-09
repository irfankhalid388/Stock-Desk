async function summary(req, res, next) {
    res.status(501).json({ error: "NOT_IMPLEMENTED" });
}

async function lowstock(req, res, next) {
    res.status(501).json({ error: "NOT_IMPLEMENTED" });
}

async function exportcsv(req, res, next) {
    res.status(501).json({ error: "NOT_IMPLEMENTED" });
}

module.exports = { summary, lowstock, exportcsv };
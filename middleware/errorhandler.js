function notFound(req, res) {
    res.status(404).json({
        error: "NOT_FOUND",
        message: "Route not found"
    });
}
function errorHandler(err, req, res, next) {
    console.log(err)
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({
            error: "DUPLICATE_ENTRY",
            message: "This record already exists"
        });
    }

    if (err.status) {
        return res.status(err.status).json({
            error: err.error || "ERROR",
            message: err.message
        });
    }

    res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong"
    });
}

module.exports = {
    notFound,
    errorHandler
};
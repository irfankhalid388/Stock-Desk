function notFound(req, res) {
    res.status(404).json({
        error: "NOT_FOUND",
        message: "Route not found"
    });
}

function errorHandler(err, req, res, next) {
    console.error(err);

    res.status(500).json({
        error: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong"
    });
}

module.exports = {
    notFound,
    errorHandler
};
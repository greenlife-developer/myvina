var errorHandler = function (err, req, res, next) {
    var statusCode = res.statusCode ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : err.stack,
    });
};
module.exports = errorHandler;

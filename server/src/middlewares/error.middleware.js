import ErrorHandler from "../utils/errorHandler.js";
import logger from "../utils/logger.js";

const errorMiddleware = (err, req, res, next) => {
    let error = err;

    if (typeof err.code === "string" && err.code.startsWith("LIMIT_")) {
        let message = "File upload error";
        switch (err.code) {
            case "LIMIT_FILE_SIZE":
                message = "File size exceeds the allowed limit (max 5 MB)";
                break;
            case "LIMIT_UNEXPECTED_FILE":
                if (err.field && err.field !== "image") {
                    message =
                        "Please upload a single image file using the field name 'image'";
                } else {
                    message = "Only one image file can be uploaded at a time.";
                }
                break;
            case "LIMIT_FILE_COUNT":
                message = "Too many files uploaded (max 5)";
                break;
            default:
                message = err.message;
        }
        error = new ErrorHandler(message, 400);
    }

    if (error.name === "CastError") {
        error = new ErrorHandler(
            `Resource not found. Invalid: ${error.path}`,
            400,
        );
    }

    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        error = new ErrorHandler(`Duplicate ${field} entered`, 400);
    }

    if (error.name === "JsonWebTokenError") {
        error = new ErrorHandler("Invalid token, please log in again", 401);
    }
    if (error.name === "TokenExpiredError") {
        error = new ErrorHandler("Session expired, please log in again", 401);
    }

    if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((val) => val.message);
        error = new ErrorHandler("Validation failed", 400, messages);
    }

    const statusCode = error.statusCode || 500;
    const message = error.isOperational
        ? error.message
        : "Internal server error";

    if (error.isOperational) {
        logger.warn(
            { path: req.originalUrl, statusCode, message: error.message },
            "Handled request error",
        );
    } else {
        logger.error(
            { err: error, path: req.originalUrl },
            "Unhandled server error",
        );
    }

    res.status(statusCode).json({
        success: false,
        message,
        errors: error.errors || [],
        ...(process.env.NODE_ENV !== "production" && { stack: error.stack }),
    });
};

export default errorMiddleware;

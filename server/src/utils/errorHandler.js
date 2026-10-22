class ErrorHandler extends Error {
    constructor(
        message = "Something went wrong",
        statusCode = 500,
        errors = [],
    ) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

export default ErrorHandler;

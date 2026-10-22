import ErrorHandler from "../utils/errorHandler.js";

export const validateRequest = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body || {});

        if (!result.success) {
            const fieldErrors = result.error.issues.map((issue) => ({
                field: issue.path[0],
                message: issue.message,
            }));

            const message = fieldErrors.map((e) => e.message).join(", ");

            return next(new ErrorHandler(message, 400, fieldErrors));
        }

        next();
    };
};

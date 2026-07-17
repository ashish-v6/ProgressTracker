"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
const errorHandler = (err, req, res, next) => {
    let statusCode = 500;
    let message = 'Internal Server Error';
    let errors = undefined;
    // Handle Custom App operational errors
    if (err instanceof errors_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
        if ('errors' in err) {
            errors = err.errors;
        }
    }
    // Handle Mongoose DB Validation Errors
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Database validation error';
        errors = Object.keys(err.errors).reduce((acc, key) => {
            acc[key] = err.errors[key].message;
            return acc;
        }, {});
    }
    // Handle Mongoose Cast Errors (Invalid ID lookups)
    else if (err.name === 'CastError') {
        statusCode = 400;
        message = `Invalid identifier format: ${err.value}`;
    }
    // Handle JSON parsing errors
    else if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
        statusCode = 400;
        message = 'Invalid JSON request payload';
    }
    // Log non-operational internal errors with stack traces, warning for expected operational ones
    if (statusCode === 500) {
        logger_1.logger.error(`[Fatal Server Error] ${err.message}`, err);
    }
    else {
        logger_1.logger.warn(`[Client Operational Error] ${statusCode} - ${message}`, { errors });
    }
    res.status(statusCode).json({
        success: false,
        message,
        data: null,
        ...(errors && { errors })
    });
};
exports.errorHandler = errorHandler;
exports.default = exports.errorHandler;
//# sourceMappingURL=error.middleware.js.map
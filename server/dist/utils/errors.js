"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ValidationError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.AppError = void 0;
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized access') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden resource') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ValidationError extends AppError {
    errors;
    constructor(message = 'Validation failed', errors) {
        super(message, 400);
        this.errors = errors;
    }
}
exports.ValidationError = ValidationError;
class ConflictError extends AppError {
    constructor(message = 'Resource conflict') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=errors.js.map
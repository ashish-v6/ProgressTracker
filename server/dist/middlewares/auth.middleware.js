"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
const protect = (req, res, next) => {
    try {
        let token;
        // Check Authorization header for Bearer token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        // Fallback to cookie check if access token is also stored in cookie
        else if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        }
        if (!token) {
            throw new errors_1.UnauthorizedError('Not authorized. Access token is missing.');
        }
        // Verify JWT Access Token
        const secret = process.env.JWT_ACCESS_SECRET || 'default_access_secret_12345';
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Attach decoded user context to request
        req.user = {
            id: decoded.userId
        };
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            next(new errors_1.UnauthorizedError('Access token has expired'));
        }
        else {
            next(new errors_1.UnauthorizedError('Not authorized. Token is invalid.'));
        }
    }
};
exports.protect = protect;
exports.default = exports.protect;
//# sourceMappingURL=auth.middleware.js.map
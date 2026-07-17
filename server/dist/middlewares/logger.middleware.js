"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.morganMiddleware = void 0;
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("../utils/logger"));
// Direct morgan log output to our custom logger utility
const stream = {
    write: (message) => logger_1.default.info(message.trim())
};
// Log all requests in development, or only errors/warning/standard entries in prod
const skip = () => {
    const env = process.env.NODE_ENV || 'development';
    return env === 'test';
};
exports.morganMiddleware = (0, morgan_1.default)(':remote-addr :method :url :status :res[content-length] - :response-time ms', { stream, skip });
exports.default = exports.morganMiddleware;
//# sourceMappingURL=logger.middleware.js.map
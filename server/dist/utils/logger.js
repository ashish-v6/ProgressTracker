"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (LogLevel = {}));
class Logger {
    logDir = path_1.default.join(process.cwd(), 'logs');
    constructor() {
        try {
            if (!fs_1.default.existsSync(this.logDir)) {
                fs_1.default.mkdirSync(this.logDir, { recursive: true });
            }
        }
        catch (err) {
            console.error('Failed to create log directory:', err);
        }
    }
    formatMessage(level, message, meta) {
        const timestamp = new Date().toISOString();
        const metaStr = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
        return `[${timestamp}] [${level}] ${message}${metaStr}`;
    }
    writeLog(level, message, meta) {
        const formatted = this.formatMessage(level, message, meta);
        // Console output
        if (level === LogLevel.ERROR) {
            console.error(formatted);
        }
        else if (level === LogLevel.WARN) {
            console.warn(formatted);
        }
        else {
            console.log(formatted);
        }
        // Write to file
        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const logFile = path_1.default.join(this.logDir, `${dateStr}.log`);
            fs_1.default.appendFileSync(logFile, formatted + '\n', 'utf8');
        }
        catch (err) {
            // Fallback if append fails
        }
    }
    debug(message, meta) {
        if (process.env.NODE_ENV !== 'production') {
            this.writeLog(LogLevel.DEBUG, message, meta);
        }
    }
    info(message, meta) {
        this.writeLog(LogLevel.INFO, message, meta);
    }
    warn(message, meta) {
        this.writeLog(LogLevel.WARN, message, meta);
    }
    error(message, error, meta) {
        let errorMeta = meta || {};
        if (error) {
            if (error instanceof Error) {
                errorMeta = { ...errorMeta, message: error.message, stack: error.stack };
            }
            else {
                errorMeta = { ...errorMeta, error };
            }
        }
        this.writeLog(LogLevel.ERROR, message, errorMeta);
    }
}
exports.logger = new Logger();
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map
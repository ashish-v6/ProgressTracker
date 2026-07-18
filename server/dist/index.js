"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables immediately
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const logger_1 = __importDefault(require("./utils/logger"));
const dns_1 = __importDefault(require("dns"));
dns_1.default.setServers([
    '1.1.1.1',
    '8.8.8.8'
]);
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/progresstracker';
logger_1.default.info('Starting server process...');
// Connect to MongoDB Database
mongoose_1.default
    .connect(MONGODB_URI)
    .then(() => {
    logger_1.default.info('Successfully connected to MongoDB Database');
    // Start listening on port
    const server = app_1.default.listen(PORT, () => {
        logger_1.default.info(`Server successfully started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        logger_1.default.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });
    // Handle system shutdown signals gracefully
    const gracefulShutdown = () => {
        logger_1.default.info('Termination signal received. Starting graceful server shutdown...');
        server.close(() => {
            logger_1.default.info('Express server connection terminated.');
            mongoose_1.default.connection
                .close()
                .then(() => {
                logger_1.default.info('MongoDB database connection terminated.');
                process.exit(0);
            })
                .catch((err) => {
                logger_1.default.error('Error during MongoDB connection shutdown', err);
                process.exit(1);
            });
        });
        // Force kill server after 10s if connections persist
        setTimeout(() => {
            logger_1.default.error('Force terminating server. Shutdown timed out.');
            process.exit(1);
        }, 10000);
    };
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
})
    .catch((error) => {
    logger_1.default.error('Failed to connect to MongoDB Database. Exiting...', error);
    process.exit(1);
});
// Handle unhandled promise rejections globally
process.on('unhandledRejection', (reason) => {
    logger_1.default.error('Unhandled Promise Rejection caught at index level:', reason);
    // Optional: Graceful exit depending on server configurations
});
// Handle uncaught exceptions globally
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception thrown at index level:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map
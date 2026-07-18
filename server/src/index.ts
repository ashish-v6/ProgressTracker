import dotenv from 'dotenv';
// Load environment variables immediately
dotenv.config();

import mongoose from 'mongoose';
import app from './app';
import logger from './utils/logger';
import dns from "dns";

dns.setServers([
  '1.1.1.1',
  '8.8.8.8'
])

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/progresstracker';

logger.info('Starting server process...');

// Connect to MongoDB Database
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('Successfully connected to MongoDB Database');

    // Start listening on port
    const server = app.listen(PORT, () => {
      logger.info(`Server successfully started on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
      logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
    });

    // Handle system shutdown signals gracefully
    const gracefulShutdown = () => {
      logger.info('Termination signal received. Starting graceful server shutdown...');

      server.close(() => {
        logger.info('Express server connection terminated.');

        mongoose.connection
          .close()
          .then(() => {
            logger.info('MongoDB database connection terminated.');
            process.exit(0);
          })
          .catch((err) => {
            logger.error('Error during MongoDB connection shutdown', err);
            process.exit(1);
          });
      });

      // Force kill server after 10s if connections persist
      setTimeout(() => {
        logger.error('Force terminating server. Shutdown timed out.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  })
  .catch((error) => {
    logger.error('Failed to connect to MongoDB Database. Exiting...', error);
    process.exit(1);
  });

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (reason: any) => {
  logger.error('Unhandled Promise Rejection caught at index level:', reason);
  // Optional: Graceful exit depending on server configurations
});

// Handle uncaught exceptions globally
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception thrown at index level:', error);
  process.exit(1);
});

// Load .env from parent directory (where the shared .env file is)
require('dotenv').config({ path: '../.env' });

const app = require('./src/app');
const connectDB = require('./src/config/database');

// Try to get logger, with fallback to console
let logger;
try {
  const loggerUtil = require('./src/utils/logger.util');
  logger = loggerUtil.logger || console;
} catch (error) {
  logger = console;
}

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// Start server
const startServer = async () => {
  try {
    // Try to connect to database
    try {
      await connectDB();
      logger.info('Database connected successfully');
    } catch (dbError) {
      logger.warn(`Database connection failed: ${dbError.message}`);
      logger.info('Running in mock mode without database');
    }
    
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Health check: http://localhost:${PORT}/health`);
    });
    
    // Graceful shutdown
    const gracefulShutdown = () => {
      logger.info('Received shutdown signal, closing server...');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
      
      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };
    
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

startServer();
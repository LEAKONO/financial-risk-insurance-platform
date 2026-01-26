const mongoose = require('mongoose');
const { logger } = require('../utils/logger.util');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    logger.info(`Connecting to MongoDB at: ${mongoURI.replace(/:[^:]*@/, ':****@')}`);
    
    // Remove deprecated options - Mongoose 6+ doesn't need them
    const conn = await mongoose.connect(mongoURI, {
      // No options needed for modern Mongoose
      // serverSelectionTimeoutMS: 5000, // Optional: timeout after 5 seconds
    });
    
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected - attempting to reconnect...');
    });
    
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    return conn;
    
  } catch (error) {
    logger.error(`❌ MongoDB connection failed: ${error.message}`);
    
    if (error.message.includes('ECONNREFUSED')) {
      logger.info('💡 MongoDB might not be running. Try:');
      logger.info('   1. Start MongoDB: sudo systemctl start mongod');
      logger.info('   2. Check status: sudo systemctl status mongod');
      logger.info('   3. Use MongoDB Atlas (cloud) instead');
    }
    
    // Re-throw the error so server.js can handle it
    throw error;
  }
};

module.exports = connectDB;
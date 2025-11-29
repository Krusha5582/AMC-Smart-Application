// Packages/backend-services/shared/index.js
// Export all shared utilities
module.exports = {
  // Config
  config: require('./config/environment'),
  database: require('./config/database'),
  log: (msg) => console.log("[SHARED]", msg),
  // Middleware
  auth: require('./middleware/auth'),
  errorHandler: require('./middleware/errorHandler'),
  validation: require('./middleware/validation'),
  
  // Utils
  logger: require('./utils/logger')
};
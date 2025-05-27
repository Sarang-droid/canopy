require('dotenv').config();

const config = {
    // Server Configuration
    port: process.env.PORT || 5000,

    // Database Configuration
    canopyDbUri: process.env.CANOPY_DB_URI,
    skillbridgeDbUri: process.env.SKILLBRIDGE_DB_URI,

    // JWT Configuration
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '30d',

    // Other Configuration
    environment: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'debug'
};

module.exports = config;
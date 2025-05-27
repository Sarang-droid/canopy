module.exports = {
    port: process.env.PORT || 5000,
    environment: process.env.NODE_ENV || 'development',
    canopyDbUri: process.env.CANOPY_DB_URI || 'mongodb://localhost:27017/canopy'
};

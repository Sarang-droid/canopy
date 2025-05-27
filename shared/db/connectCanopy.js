const mongoose = require('mongoose');
const config = require('../../config');

const connectCanopyDB = async () => {
    try {
        await mongoose.connect(config.canopyDbUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });
        console.log('Connected to Canopy Database');
    } catch (error) {
        console.error('Error connecting to Canopy Database:', error);
        process.exit(1);
    }
};

module.exports = connectCanopyDB;

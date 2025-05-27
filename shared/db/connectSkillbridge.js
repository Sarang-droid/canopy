const mongoose = require('mongoose');
const config = require('../../config');

const connectSkillbridgeDB = async () => {
    try {
        await mongoose.connect(config.skillbridgeDbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to Skillbridge Database');
    } catch (error) {
        console.error('Error connecting to Skillbridge Database:', error);
        process.exit(1);
    }
};

module.exports = connectSkillbridgeDB;

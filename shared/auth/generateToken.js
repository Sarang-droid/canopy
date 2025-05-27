const jwt = require('jsonwebtoken');
const config = require('../../config');

const generateToken = (user) => {
    const payload = {
        userId: user.userId,
        department: user.department,
        role: user.role
    };

    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpire
    });
};

module.exports = generateToken;

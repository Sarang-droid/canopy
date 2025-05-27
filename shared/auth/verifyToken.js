const jwt = require('jsonwebtoken');
const config = require('../../config');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            error: 'Access denied. No token provided.'
        });
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Invalid token.'
        });
    }
};

module.exports = verifyToken;

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Check if user has valid canopy access
router.get('/check-access', (req, res) => {
    try {
        const token = req.cookies.canopyAccess;
        if (!token) {
            return res.status(403).json({ 
                message: 'Access denied',
                error: 'Canopy access token required'
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId || decoded.department !== 'Canopy') {
            return res.status(403).json({ 
                message: 'Access denied',
                error: 'Invalid access token'
            });
        }

        // Token is valid
        res.json({
            message: 'Access granted',
            success: true
        });
    } catch (error) {
        return res.status(403).json({ 
            message: 'Access denied',
            error: 'Invalid or expired access token'
        });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const branchAuthController = require('./controller/branchAuthController');

// Middleware to check Canopy access cookie
const checkCanopyAccess = (req, res, next) => {
    const token = req.cookies.canopyAccess;
    if (!token) {
        res.status(403).json({ 
            message: 'Access denied',
            error: 'Canopy access token required'
        });
        return;
    }
    next();
};

// Protected routes that require Canopy access
router.get('/dashboard', checkCanopyAccess, (req, res) => {
    // Example protected route - in production this would return actual dashboard data
    res.json({
        message: 'Welcome to Canopy Dashboard',
        user: req.user
    });
});

// Export routes
module.exports = router;
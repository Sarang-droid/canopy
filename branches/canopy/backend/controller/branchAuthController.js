const path = require('path');
const User = require(path.resolve(__dirname, '../../../../Core/backend/models/Users.js'));
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Load environment variables
require('dotenv').config();

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in environment variables');
}

// Validate branch credentials
const validateBranchAccess = async (req, res) => {
    try {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { userId, password } = req.body;

        // Find user by userId
        const user = await User.findOne({ userId });
        
        if (!user) {
            return res.status(401).json({ 
                message: 'Invalid credentials',
                error: 'User not found' 
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid credentials',
                error: 'Incorrect password' 
            });
        }

        // Check if user belongs to Canopy department
        if (user.department !== 'Canopy') {
            return res.status(403).json({ 
                message: 'Access denied',
                error: 'User is not authorized for Canopy access' 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.userId, department: user.department },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Set canopyAccess cookie
        res.cookie('canopyAccess', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 3600000 // 1 hour
        });

        return res.json({
            message: 'Access granted',
            success: true
        });

    } catch (error) {
        console.error('Branch auth error:', error);
        return res.status(500).json({ 
            message: 'Server error',
            error: error.message 
        });
    }
};

module.exports = {
    validateBranchAccess
};
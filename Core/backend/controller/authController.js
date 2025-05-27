const User = require('../models/Users');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Helper function to generate user ID
const generateUserId = async (department) => {
    const departmentCodes = {
        Technical: 'TEC',
        Financial: 'FIN',
        Project: 'PRO',
        Legal: 'LEG',
        Compliance: 'COM',
        Marketing: 'MAR',
        Canopy: 'CAN'
    };
    
    const departmentCode = departmentCodes[department];
    // Get the last user with this department code and increment
    const lastUser = await User.findOne({ userId: { $regex: `^${departmentCode}-` } })
        .sort('-userId');
    
    let sequenceNumber = 1;
    if (lastUser) {
        const lastNum = parseInt(lastUser.userId.split('-')[1]);
        sequenceNumber = lastNum + 1;
    }
    
    return `${departmentCode}-${sequenceNumber.toString().padStart(3, '0')}`;
};

// Helper function to generate secure password
const generatePassword = () => {
    const length = 12;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// Registration
exports.register = async (req, res) => {
    try {
        const { name, email, department, role } = req.body;
        
        // Generate user ID and password
        const userId = await generateUserId(department);
        const password = generatePassword();
        
        // Create new user
        const user = new User({
            userId,
            password,
            name,
            email,
            department,
            role
        });
        
        // Save user to database
        await user.save();
        
        // Return user ID and password to frontend
        res.status(201).json({
            userId,
            password,
            message: 'Registration successful'
        });
    } catch (error) {
        res.status(500).json({
            error: 'Registration failed',
            details: error.message
        });
    }
};

// Login
exports.login = async (req, res) => {
    try {
        const { userId, password } = req.body;
        
        // Find user by userId
        const user = await User.findOne({ userId });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }
        
        // Verify password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }
        
        // Generate JWT
        const token = jwt.sign(
            {
                userId: user.userId,
                department: user.department,
                role: user.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );
        
        res.json({
            token,
            userId: user.userId,
            department: user.department,
            role: user.role
        });
    } catch (error) {
        res.status(500).json({
            error: 'Login failed',
            details: error.message
        });
    }
};
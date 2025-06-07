const express = require('express');
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const config = require('./config');
const connectCanopyDB = require('./shared/db/connectCanopy');
const requestLogger = require('./shared/middleware/requestLogger');

// Core routes
const coreRoutes = require('./Core/backend/routes/indexRoutes');
const authRoutes = require('./Core/backend/routes/authRoutes');
const branchAuthRoutes = require('./branches/canopy/backend/routes/branchAuthRoutes');
const progenixRoutes = require('./branches/canopy/backend/routes/progenixRoutes');
const authCheckRoutes = require('./branches/canopy/backend/routes/authCheckRoutes');
const jobRoutes = require('./branches/canopy/backend/routes/jobRoutes');

const app = express();

// Middleware setup
app.use(cors({
    credentials: true,
    origin: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Database connection
connectCanopyDB().catch(console.error);

// Authentication middleware
const authMiddleware = (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
        // If no token, redirect to register.html
        res.redirect('/register.html');
        return;
    }
    next();
};

// Static files and frontend
app.use(express.static(path.join(__dirname, 'Core/frontend')));
app.use('/branches/canopy/frontend', express.static(path.join(__dirname, 'branches/canopy/frontend')));

// Routes for static files
app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Core/frontend', 'register.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Core/frontend', 'login.html'));
});

// Protected route for index.html
app.get('/index.html', authMiddleware, (req, res) => {
    res.sendFile(path.join(__dirname, 'Core/frontend', 'index.html'));
});

// Public route for Canopy access page
app.get('/branches/canopy/frontend/Canopy-access.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'branches/canopy/frontend', 'Canopy-access.html'));
});

// Protected route for Canopy branch (requires authentication)
app.get('/branches/canopy/frontend/Canopy.html', authMiddleware, (req, res) => {
    // Check if user has canopy access
    if (!req.cookies.canopyAccess) {
        res.redirect('/branches/canopy/frontend/Canopy-access.html');
        return;
    }
    res.sendFile(path.join(__dirname, 'branches/canopy/frontend', 'Canopy.html'));
});

// Default route - redirect to register.html
app.get('/', (req, res) => {
    res.redirect('/register.html');
});

// Catch-all route for any other requests
app.get('*', (req, res) => {
    res.redirect('/register.html');
});

// API routes
app.use('/api/core/auth', authRoutes);
app.use('/api/core', coreRoutes);
app.use('/api/canopy/auth', branchAuthRoutes);
app.use('/api/canopy/auth', authCheckRoutes);
app.use('/api/canopy/progenix', progenixRoutes);
app.use('/api/jobs', jobRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        error: {
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: {
            message: 'Not Found'
        }
    });
});

// Log all routes
console.log('\nRegistered Routes:');
app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
        console.log(`Route: ${r.route.path}`);
    }
});
console.log('\n');

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Export app for testing
module.exports = app;
const express = require('express');
const router = express.Router();
const { generateProjectIdeas } = require('../agents/progenixgpt');

// Middleware to check Canopy access cookie
const checkCanopyAccess = (req, res, next) => {
    try {
        // Get cookie from headers
        const cookieHeader = req.headers.cookie;
        if (!cookieHeader) {
            return res.status(403).json({ 
                message: 'Access denied',
                error: 'No cookies provided'
            });
        }

        // Extract canopyAccess cookie
        const cookies = cookieHeader.split('; ').map(c => c.trim());
        const tokenCookie = cookies.find(cookie => cookie.startsWith('canopyAccess='));
        if (!tokenCookie) {
            return res.status(403).json({ 
                message: 'Access denied',
                error: 'Canopy access token required'
            });
        }

        const token = tokenCookie.split('=')[1];
        
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId || decoded.department !== 'Canopy') {
            return res.status(403).json({ 
                message: 'Access denied',
                error: 'Invalid access token'
            });
        }

        // Add user info to request for use in routes
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Access check error:', error);
        return res.status(403).json({ 
            message: 'Access denied',
            error: 'Invalid or expired access token'
        });
    }
};

// Generate projects route
router.post('/generate', checkCanopyAccess, async (req, res) => {
    try {
        const { jobTitle } = req.body;
        if (!jobTitle) {
            return res.status(400).json({
                message: 'Missing required parameter',
                error: 'jobTitle is required'
            });
        }

        // Get job data from request body or use default
        const jobData = req.body.jobData || {};

        // Generate project ideas
        const result = await generateProjectIdeas(jobTitle, jobData);
        
        res.json({
            projects: result.projects,
            insights: result.insights
        });
    } catch (error) {
        console.error('Error generating projects:', error);
        res.status(500).json({
            message: 'Error generating projects',
            error: error.message
        });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { generateProjectIdeas } = require('../agents/progenixgpt');

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

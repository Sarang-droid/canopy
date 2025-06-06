const express = require('express');
const router = express.Router();
const { generateProjectIdeas } = require('../agents/progenixgpt');
const jwt = require('jsonwebtoken');

// Load environment variables
require('dotenv').config();

// Ensure JWT_SECRET is set
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in environment variables');
}

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
    const { jobTitle, jobData = {} } = req.body;

    if (!jobTitle) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter',
        error: 'jobTitle is required'
      });
    }

    console.log(`🔍 Starting job market analysis for: ${jobTitle}`);

    // Scrape job data if not provided
    let finalJobData = jobData;
    if (Object.keys(jobData).length === 0) {
      console.log('🔍 Scraping job data...');
      const scraperManager = require('../scrapers/scraperManager');
      const scraper = new scraperManager();
      finalJobData = await scraper.scrapeJobs(jobTitle, 'India', 2);
      console.log(`🔍 Scraped ${finalJobData.jobs?.length || 0} jobs`);
      console.log('🔍 Sample job data:', finalJobData.jobs?.slice(0, 2) || []);
    }

    // Generate project ideas
    const projectIdeas = await generateProjectIdeas(jobTitle, finalJobData);
    console.log('✅ Generated project ideas:', projectIdeas);

    res.json({
      success: true,
      projects: projectIdeas.projects,
      insights: projectIdeas.insights
    });
  } catch (error) {
    console.error('❌ Error processing job market data:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating projects',
      error: error.message
    });
  }
});

module.exports = router;
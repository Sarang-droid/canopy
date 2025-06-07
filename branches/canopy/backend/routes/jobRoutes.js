const express = require('express');
const router = express.Router();
const ScraperManager = require('../scrapers/scraperManager');
const scraperManager = new ScraperManager();

// Route to scrape jobs and export to Excel
router.post('/scrape-and-export', async (req, res) => {
    try {
        const { query, location = 'India', pages = 1 } = req.body;
        
        if (!query) {
            return res.status(400).json({ error: 'Job title is required' });
        }

        console.log(`🔍 Starting job market analysis for: ${query}`);
        
        // Scrape jobs
        const { jobs, analysis } = await scraperManager.scrapeJobs(query, location, pages);
        
        console.log(`🔍 Scraped ${jobs.length} jobs`);
        
        // Generate Excel file
        const filename = `${query.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
        const filePath = await scraperManager.saveToExcel(jobs, filename);
        
        // Return success response
        res.json({
            success: true,
            message: 'Jobs scraped and Excel file created successfully',
            filePath: filePath,
            jobCount: jobs.length,
            analysis
        });
    } catch (error) {
        console.error('❌ Error in scrape-and-export:', error);
        res.status(500).json({
            error: 'Failed to scrape jobs and create Excel file',
            details: error.message
        });
    }
});

module.exports = router;

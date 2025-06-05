const IndeedScraper = require('./indeedScraper');
const JSearchScraper = require('./jsearchScraper');

class ScraperManager {
    constructor() {
        this.scrapers = {
            indeed: new IndeedScraper(),
            jsearch: new JSearchScraper()
        };
    }

    async scrapeJobs(query, location = 'India', pages = 1) {
        const results = [];
        
        // Scrape from Indeed
        try {
            const indeedJobs = await this.scrapers.indeed.scrape(query, location, pages);
            results.push(...indeedJobs);
        } catch (error) {
            console.error('Error scraping from Indeed:', error);
        }

        // Scrape from JSearch API
        try {
            const jsearchJobs = await this.scrapers.jsearch.search(query, location, pages);
            results.push(...jsearchJobs);
        } catch (error) {
            console.error('Error searching JSearch API:', error);
        }

        return this.analyzeResults(results);
    }

    analyzeResults(jobs) {
        const analysis = {
            totalJobs: jobs.length,
            insights: {
                topSkills: {},
                salaryRanges: {},
                locations: {},
                companies: {}
            }
        };

        // Count skills
        jobs.forEach(job => {
            job.skills.forEach(skill => {
                analysis.insights.topSkills[skill] = 
                    (analysis.insights.topSkills[skill] || 0) + 1;
            });

            // Count salary ranges
            if (job.salary) {
                const salary = parseInt(job.salary.replace(/[^0-9]/g, ''));
                if (!isNaN(salary)) {
                    const range = Math.floor(salary / 10000) * 10000;
                    analysis.insights.salaryRanges[range] = 
                        (analysis.insights.salaryRanges[range] || 0) + 1;
                }
            }

            // Count locations
            if (job.location) {
                analysis.insights.locations[job.location] = 
                    (analysis.insights.locations[job.location] || 0) + 1;
            }

            // Count companies
            if (job.company) {
                analysis.insights.companies[job.company] = 
                    (analysis.insights.companies[job.company] || 0) + 1;
            }
        });

        // Get top 10 skills
        analysis.insights.topSkills = Object.entries(analysis.insights.topSkills)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, count }));

        // Get salary ranges in order
        analysis.insights.salaryRanges = Object.entries(analysis.insights.salaryRanges)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([range, count]) => ({
                range: `${range}-${parseInt(range) + 9999}`,
                count
            }));

        return {
            jobs,
            analysis
        };
    }
}

module.exports = ScraperManager;

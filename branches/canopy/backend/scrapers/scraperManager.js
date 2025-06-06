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
        
        // Run scrapers in parallel
        const scrapePromises = [
            this.scrapers.indeed.scrape(query, location, pages).catch(error => {
                console.error('Error scraping from Indeed:', error);
                return [];
            }),
            this.scrapers.jsearch.search(query, location, pages).catch(error => {
                console.error('Error searching JSearch API:', error);
                return [];
            })
        ];

        const [indeedJobs, jsearchJobs] = await Promise.all(scrapePromises);
        results.push(...indeedJobs, ...jsearchJobs);

        // Validate data
        if (results.length < 5) {
            console.warn(`Warning: Only ${results.length} jobs scraped for "${query}" in ${location}`);
        }

        return this.analyzeResults(results);
    }

    saveToCSV(jobs, filename = 'scraped_jobs.csv') {
        const fs = require('fs');
        const csv = require('csv-writer').createObjectCsvStringifier({
            header: [
                {id: 'title', title: 'TITLE'},
                {id: 'company', title: 'COMPANY'},
                {id: 'location', title: 'LOCATION'},
                {id: 'salary', title: 'SALARY'},
                {id: 'skills', title: 'SKILLS'},
                {id: 'description', title: 'DESCRIPTION'},
                {id: 'source', title: 'SOURCE'}
            ]
        });

        const csvString = csv.getHeaderString() + jobs.map(job => csv.stringifyRecord(job)).join('');
        
        try {
            fs.writeFileSync(filename, csvString);
            console.log(`✅ Saved ${jobs.length} jobs to ${filename}`);
        } catch (error) {
            console.error('❌ Error saving to CSV:', error);
        }
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

        jobs.forEach(job => {
            // Count skills
            if (job.skills && Array.isArray(job.skills)) {
                job.skills.forEach(skill => {
                    analysis.insights.topSkills[skill] = (analysis.insights.topSkills[skill] || 0) + 1;
                });
            }

            // Parse and count salary ranges
            if (job.salary) {
                const salaryMatch = job.salary.match(/(\d+[\d,\.]*)\s*-\s*(\d+[\d,\.]*)/) || 
                                    job.salary.match(/(\d+[\d,\.]*)/);
                if (salaryMatch) {
                    const minSalary = parseFloat(salaryMatch[1].replace(/[^0-9.]/g, ''));
                    if (!isNaN(minSalary)) {
                        const range = Math.floor(minSalary / 10000) * 10000;
                        const rangeKey = `${range}-${range + 9999}`;
                        analysis.insights.salaryRanges[rangeKey] = 
                            (analysis.insights.salaryRanges[rangeKey] || 0) + 1;
                    }
                }
            }

            // Count locations and companies
            if (job.location) {
                analysis.insights.locations[job.location] = 
                    (analysis.insights.locations[job.location] || 0) + 1;
            }
            if (job.company) {
                analysis.insights.companies[job.company] = 
                    (analysis.insights.companies[job.company] || 0) + 1;
            }
        });

        // Sort and format results
        analysis.insights.topSkills = Object.entries(analysis.insights.topSkills)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([skill, count]) => ({ skill, count }));

        analysis.insights.salaryRanges = Object.entries(analysis.insights.salaryRanges)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .map(([range, count]) => ({ range, count }));

        analysis.insights.locations = Object.entries(analysis.insights.locations)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([location, count]) => ({ location, count }));

        analysis.insights.companies = Object.entries(analysis.insights.companies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([company, count]) => ({ company, count }));

        return { jobs, analysis };
    }
}

module.exports = ScraperManager;
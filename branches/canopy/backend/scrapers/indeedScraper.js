const BaseScraper = require('./baseScraper');

class IndeedScraper extends BaseScraper {
    constructor() {
        super({
            name: 'indeed',
            baseUrl: 'https://www.indeed.com', // Use global domain, auto-redirects to regional
            selectors: {
                jobCards: '.job_seen_beacon',
                title: '.jobTitle',
                company: '.companyName',
                location: '.companyLocation',
                salary: '.salary-snippet, .estimated-salary',
                description: '.job-snippet'
            }
        });
    }

    async scrape(query, location = 'India', pages = 1) {
        await this.init();
        const jobs = [];

        for (let page = 0; page < pages; page++) {
            const url = `${this.config.baseUrl}/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&start=${page * 10}`;
            try {
                const $ = await this.fetchPage(url, this.config.selectors.jobCards, true);
                const jobCards = $(this.config.selectors.jobCards);
                
                for (let i = 0; i < jobCards.length; i++) {
                    const card = jobCards[i];
                    const job = {
                        title: $(card).find(this.config.selectors.title).text().trim(),
                        company: $(card).find(this.config.selectors.company).text().trim(),
                        location: $(card).find(this.config.selectors.location).text().trim(),
                        salary: $(card).find(this.config.selectors.salary).text().trim(),
                        description: $(card).find(this.config.selectors.description).text().trim(),
                        source: this.config.name,
                        url: this.config.baseUrl + $(card).find('a').attr('href') || ''
                    };

                    // Fetch full description from job page if URL exists
                    if (job.url) {
                        try {
                            const jobPage = await this.fetchPage(job.url, '.jobsearch-JobComponent-description', true);
                            job.description = jobPage('.jobsearch-JobComponent-description').text().trim() || job.description;
                        } catch (error) {
                            console.warn(`Failed to fetch full description for ${job.url}:`, error);
                        }
                    }

                    if (job.title && job.description) {
                        jobs.push(this.normalizeJob(job));
                    }
                }
            } catch (error) {
                console.error(`Failed to scrape page ${page + 1} from Indeed:`, error);
            }
        }

        await this.close();
        return jobs;
    }
}

module.exports = IndeedScraper;
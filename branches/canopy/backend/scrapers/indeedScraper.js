const BaseScraper = require('./baseScraper');

class IndeedScraper extends BaseScraper {
    constructor() {
        super({
            name: 'indeed',
            baseUrl: 'https://www.indeed.co.in',
            selectors: {
                jobCards: '.job_seen_beacon',
                title: '.jobTitle',
                company: '.companyName',
                location: '.companyLocation',
                salary: '.salary-snippet',
                description: '.job-snippet'
            }
        });
    }

    async scrape(query, location = 'India', pages = 1) {
        await this.init();
        const jobs = [];

        for (let page = 0; page < pages; page++) {
            const url = `${this.config.baseUrl}/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&start=${page * 10}`;
            const $ = await this.fetchPage(url);

            $(this.config.selectors.jobCards).each((i, card) => {
                const job = {
                    title: $(card).find(this.config.selectors.title).text().trim(),
                    company: $(card).find(this.config.selectors.company).text().trim(),
                    location: $(card).find(this.config.selectors.location).text().trim(),
                    salary: $(card).find(this.config.selectors.salary).text().trim(),
                    description: $(card).find(this.config.selectors.description).text().trim(),
                    source: this.config.name,
                    url: this.config.baseUrl + $(card).find('.jobTitle').parent().attr('href')
                };

                if (job.title && job.description) {
                    jobs.push(this.normalizeJob(job));
                }
            });
        }

        await this.close();
        return jobs;
    }
}

module.exports = IndeedScraper;

const BaseScraper = require('./baseScraper');

class JSearchScraper extends BaseScraper {
    constructor() {
        super({
            name: 'jsearch',
            baseUrl: 'https://jsearch.p.rapidapi.com',
            headers: {
                'X-RapidAPI-Key': process.env.JSEARCH_API_KEY,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        });
    }

    async search(query, location = 'India', pages = 1) {
        const jobs = [];

        for (let page = 1; page <= pages; page++) {
            const params = {
                query,
                location,
                page
            };

            try {
                const data = await this.fetchApi(`${this.config.baseUrl}/search`, params, this.config.headers);
                
                if (data.data) {
                    data.data.forEach(job => {
                        const normalizedJob = this.normalizeJob({
                            title: job.job_title,
                            company: job.employer_name,
                            location: job.job_city,
                            description: job.job_description,
                            salary: job.salary,
                            url: job.job_url,
                            skills: this.extractSkills(job.job_description)
                        });
                        jobs.push(normalizedJob);
                    });
                }
            } catch (error) {
                console.error(`Error fetching page ${page} from JSearch:`, error);
            }
        }

        return jobs;
    }
}

module.exports = JSearchScraper;

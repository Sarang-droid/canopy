const BaseScraper = require('./baseScraper');

class JSearchScraper extends BaseScraper {
    constructor() {
        const apiKey = process.env.JSEARCH_API_KEY;
        if (!apiKey) {
            console.warn('⚠️ JSEARCH_API_KEY is not set. Using fallback data.');
            return {
                jobs: [],
                analysis: {
                    totalJobs: 0,
                    insights: {
                        topSkills: [],
                        locations: [],
                        companies: [],
                        salaryRanges: []
                    }
                }
            };
        }
        
        // Validate API key format
        if (!/^[a-zA-Z0-9-_]+$/.test(apiKey)) {
            console.warn('⚠️ Invalid JSEARCH_API_KEY format. Using fallback data.');
            return {
                jobs: [],
                analysis: {
                    totalJobs: 0,
                    insights: {
                        topSkills: [],
                        locations: [],
                        companies: [],
                        salaryRanges: []
                    }
                }
            };
        }

        super({
            name: 'jsearch',
            baseUrl: 'https://jsearch.p.rapidapi.com',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
            }
        });
    }

    async search(query, location = 'India', pages = 1) {
        const jobs = [];

        for (let page = 1; page <= pages; page++) {
            const params = {
                query: `${query} in ${location}`,
                page,
                num_pages: 1
            };

            try {
                const data = await this.fetchApi(`${this.config.baseUrl}/search`, params, this.config.headers);
                
                if (data.data && Array.isArray(data.data)) {
                    for (const job of data.data) {
                        const normalizedJob = this.normalizeJob({
                            title: job.job_title || '',
                            company: job.employer_name || '',
                            location: job.job_city || job.job_country || location,
                            description: job.job_description || '',
                            salary: job.job_min_salary ? 
                                `${job.job_min_salary}-${job.job_max_salary || ''} ${job.job_salary_currency || ''}` : '',
                            url: job.job_apply_link || '',
                            skills: await this.extractSkills(job.job_description || '')
                        });
                        if (normalizedJob && normalizedJob.title && normalizedJob.description) {
                            jobs.push(normalizedJob);
                        }
                    }
                }
            } catch (error) {
                console.error(`Error fetching page ${page} from JSearch:`, error);
            }
            await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to avoid rate limits
        }

        return jobs;
    }
}

module.exports = JSearchScraper;
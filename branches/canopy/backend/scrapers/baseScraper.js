const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

class BaseScraper {
    constructor(config) {
        this.config = config;
        this.browser = null;
    }

    async init() {
        if (!this.browser) {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    async fetchPage(url) {
        try {
            const page = await this.browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });
            const html = await page.content();
            return cheerio.load(html);
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
            throw error;
        }
    }

    async fetchApi(url, params = {}, headers = {}) {
        try {
            const response = await axios.get(url, {
                params,
                headers: {
                    ...headers,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            return response.data;
        } catch (error) {
            console.error(`Error fetching API ${url}:`, error);
            throw error;
        }
    }

    normalizeJob(job) {
        // Ensure we have a proper object
        if (!job) return null;
        
        // Ensure skills is always an array
        const skills = Array.isArray(job.skills) ? job.skills : 
            typeof job.skills === 'string' ? job.skills.split(',').map(skill => skill.trim()) :
            [];

        return {
            title: job.title || '',
            company: job.company || '',
            location: job.location || '',
            description: job.description || '',
            salary: job.salary || '',
            skills: skills,
            source: job.source || this.config.name,
            url: job.url || '',
            timestamp: new Date().toISOString()
        };
    }

    async extractSkills(description) {
        const skills = [];
        const skillPatterns = [
            /\b(java(script)?|node\.js|react|vue\.js|angular|typescript|python|ruby|go|php|c\+\+|c#|swift|kotlin)\b/i,
            /\b(aws|azure|gcp|docker|kubernetes|terraform|jenkins|git|github|gitlab|bitbucket)\b/i,
            /\b(sql|mongodb|postgresql|mysql|redis|cassandra|elasticsearch)\b/i,
            /\b(react native|flutter|swiftui|android|ios|flutter)\b/i,
            /\b(aws|azure|gcp|docker|kubernetes|terraform|jenkins|git|github|gitlab|bitbucket)\b/i,
            /\b(aws|azure|gcp|docker|kubernetes|terraform|jenkins|git|github|gitlab|bitbucket)\b/i
        ];

        skillPatterns.forEach(pattern => {
            const matches = description.match(pattern);
            if (matches) {
                skills.push(...matches.map(match => match.toLowerCase()));
            }
        });

        return [...new Set(skills)];
    }
}

module.exports = BaseScraper;

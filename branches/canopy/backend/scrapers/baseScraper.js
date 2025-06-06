const axios = require('axios');
const cheerio = require('cheerio');

const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Accept': 'application/json'
};

// Global browser instance for Puppeteer
let browser = null;

// Initialize browser if needed
async function getBrowser() {
    try {
        if (!browser) {
            const puppeteer = require('puppeteer');
            browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
        }
        return browser;
    } catch (error) {
        console.warn('⚠️ Puppeteer initialization failed:', error.message);
        return null;
    }
}

class BaseScraper {
    constructor(config) {
        this.config = config || {};
        this.headers = { ...defaultHeaders, ...this.config.headers };
        this.rateLimiter = {
            windowMs: 60 * 1000,
            maxRequests: 5,
            requestCount: 0,
            lastRequest: Date.now(),
            retryCount: 0,
            maxRetries: 3
        };
        this.axios = axios.create({
            headers: this.headers,
            timeout: 10000,
            validateStatus: (status) => status >= 200 && status < 500
        });
    }

    async init() {
        return this;
    }

    async fetchApi(url, params = {}, headers = {}) {
        const now = Date.now();

        if (now - this.rateLimiter.lastRequest > this.rateLimiter.windowMs) {
            this.rateLimiter.requestCount = 0;
            this.rateLimiter.lastRequest = now;
            this.rateLimiter.retryCount = 0;
        }

        if (this.rateLimiter.requestCount >= this.rateLimiter.maxRequests) {
            if (this.rateLimiter.retryCount >= this.rateLimiter.maxRetries) {
                throw new Error('Rate limit exceeded after multiple retries');
            }
            const waitTime = this.rateLimiter.windowMs - (now - this.rateLimiter.lastRequest) + 1000;
            console.log(`⏳ Waiting ${waitTime}ms for rate limit reset...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            this.rateLimiter.retryCount++;
        }

        const finalHeaders = {
            ...headers,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const queryString = new URLSearchParams(params).toString();
        const fullUrl = queryString ? `${url}?${queryString}` : url;

        console.log(`🔍 Fetching API: ${fullUrl}`);

        try {
            const response = await this.axios.get(fullUrl, { headers: finalHeaders });
            this.rateLimiter.requestCount++;
            this.rateLimiter.retryCount = 0;
            return response.data;
        } catch (error) {
            console.error(`❌ Error fetching API ${url}:`, error.message);

            if (error.response?.status === 429 && this.rateLimiter.retryCount < this.rateLimiter.maxRetries) {
                console.log(`🔄 Retrying after rate limit... (attempt ${this.rateLimiter.retryCount + 1}/${this.rateLimiter.maxRetries})`);
                this.rateLimiter.retryCount++;
                await new Promise(resolve => setTimeout(resolve, 1000 * this.rateLimiter.retryCount));
                return this.fetchApi(url, params, headers);
            }

            throw error;
        }
    }

    async fetchPage(url, selector = null, usePuppeteer = false) {
        try {
            // Try axios first
            const response = await this.axios.get(url, {
                headers: this.headers,
                timeout: 10000
            });
            
            // Parse HTML with cheerio
            const $ = cheerio.load(response.data);
            return $;
        } catch (axiosError) {
            console.log('❌ Axios failed, trying Puppeteer...');
            
            // Fall back to Puppeteer if axios fails
            try {
                const browser = await getBrowser();
                if (!browser) {
                    throw new Error('Puppeteer not available');
                }
                
                const page = await browser.newPage();
                try {
                    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
                    if (selector) {
                        await page.waitForSelector(selector, { timeout: 10000 });
                    }
                    const html = await page.content();
                    
                    // Parse HTML with cheerio
                    const $ = cheerio.load(html);
                    return $;
                } finally {
                    await page.close();
                }
            } catch (puppeteerError) {
                console.error('❌ Both axios and Puppeteer failed:', {
                    axiosError: axiosError.message,
                    puppeteerError: puppeteerError.message
                });
                throw new Error(`Failed to fetch ${url}: ${axiosError.message}`);
            }
        }
    }

    async close() {
        if (browser) {
            await browser.close();
            browser = null;
        }
    }

    normalizeJob(job) {
        if (!job) return null;

        const skills = Array.isArray(job.skills)
            ? job.skills
            : typeof job.skills === 'string'
            ? job.skills.split(',').map(skill => skill.trim())
            : [];

        return {
            title: job.title?.trim() || '',
            company: job.company?.trim() || '',
            location: job.location?.trim() || '',
            description: job.description?.trim() || '',
            salary: job.salary?.trim() || '',
            skills: job.description ? this.extractSkills(job.description) : skills,
            source: job.source || this.config.name,
            url: job.url?.trim() || '',
            timestamp: new Date().toISOString()
        };
    }

    extractSkills(description) {
        if (!description) return [];

        const skillPatterns = [
            /\b(java(script)?|node\.js|react|vue\.js|angular|typescript|python|ruby|go|php|c\+\+|c#|swift|kotlin)\b/gi,
            /\b(aws|azure|gcp|docker|kubernetes|terraform|jenkins|git|github|gitlab|bitbucket)\b/gi,
            /\b(sql|mongodb|postgresql|mysql|redis|cassandra|elasticsearch)\b/gi,
            /\b(react native|flutter|swiftui|android|ios)\b/gi
        ];

        const foundSkills = new Set();

        for (const pattern of skillPatterns) {
            const matches = description.match(pattern);
            if (matches) {
                matches.forEach(skill => foundSkills.add(skill.toLowerCase()));
            }
        }

        return Array.from(foundSkills);
    }
}

module.exports = BaseScraper;

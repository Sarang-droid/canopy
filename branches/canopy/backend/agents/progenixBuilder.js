// Progenix Builder - Backend Controller
const { generateProjectIdeas } = require('./progenixgpt');
const ScraperManager = require('../scrapers/scraperManager');
const mongoose = require('mongoose');
const OpenAI = require('openai');

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Project schema
const ProjectSchema = new mongoose.Schema({
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    companyType: { type: String, required: true },
    projectId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    industry: { type: String, required: true },
    projectType: { type: String, required: true },
    preferredSkills: [{ type: String }],
    minExperienceRequired: { type: Number, required: true },
    tasks: [{
        taskId: { type: String, required: true },
        taskName: { type: String, required: true },
        completed: { type: Boolean, default: false }
    }],
    submissionDeadline: { type: Date, required: true },
    difficulty: { type: Number, required: true },
    resources: [{
        name: { type: String, required: true },
        url: { type: String, required: true },
        description: { type: String }
    }],
    status: { type: String, default: 'active' },
    applicants: { type: Number, default: 0 },
    completedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Project model
const Project = mongoose.model('Project', ProjectSchema);

// Main controller function
async function buildProjects(req, res) {
    try {
        const { jobTitle, location = 'India' } = req.body;

        if (!jobTitle) {
            return res.status(400).json({
                success: false,
                message: 'Job title is required'
            });
        }

        console.log(`🤖 Progenix: Generating projects for "${jobTitle}" in ${location}`);

        // Initialize scraper manager
        const scraperManager = new ScraperManager();
        
        // Scrape job data
        const { jobs, analysis } = await scraperManager.scrapeJobs(jobTitle, location, 2);

        // Generate project ideas using GPT
        const result = await generateProjectIdeas(jobTitle, jobs);

        // Log job data for debugging
        console.log(`🔍 Job Market Analysis for "${jobTitle}":`);
        console.log(`- Total Jobs Found: ${jobs.length}`);
        console.log(`- Top Skills:`, analysis.insights.topSkills);
        console.log(`- Sample Job Titles:`, jobs.slice(0, 3).map(job => job.title));

        // Get sample jobs (first 5 jobs)
        const sampleJobs = jobs.slice(0, 5).map(job => ({
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            skills: job.skills
        }));

        // Save projects to MongoDB
        const projects = result.projects.map(project => ({
            companyId: mongoose.Types.ObjectId(),
            companyType: "progenix",
            projectId: `PROJ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            title: project.title,
            description: project.description,
            industry: jobTitle,
            projectType: "technical",
            preferredSkills: project.techStack,
            minExperienceRequired: 1,
            tasks: project.tasks.map(task => ({
                taskId: `TASK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                taskName: task,
                completed: false
            })),
            submissionDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            difficulty: project.difficulty,
            resources: [
                {
                    name: "GitHub Repository Template",
                    url: "https://github.com/progenix/project-template",
                    description: "Basic project structure and documentation"
                },
                {
                    name: "Tech Documentation",
                    url: "https://docs.github.com",
                    description: "Official documentation for GitHub"
                }
            ]
        }));

        // Save to database
        try {
            const savedProjects = await Project.insertMany(projects);
            console.log(`✅ Progenix: Successfully generated and saved ${savedProjects.length} projects`);
            console.log('Projects saved:', savedProjects.map(p => ({ title: p.title, id: p._id })));
        } catch (error) {
            console.error('Error saving projects to database:', error);
            throw error;
        }

        return res.status(200).json({
            success: true,
            jobTitle: jobTitle,
            location: location,
            projects: savedProjects,
            insights: {
                totalJobs: jobs.length,
                topSkills: Object.entries(analysis.insights.topSkills)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .map(([skill, count]) => ({ skill, count })),
                sampleJobs: sampleJobs,
                salaryRanges: analysis.insights.salaryRanges,
                locations: analysis.insights.locations,
                companies: analysis.insights.companies
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Progenix Error:', error.message);
        
        return res.status(500).json({
            success: false,
            message: 'Failed to generate projects. Please try again.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

module.exports = {
    buildProjects
};
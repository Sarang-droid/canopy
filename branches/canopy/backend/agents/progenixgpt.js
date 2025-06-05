// Progenix GPT Integration
const OpenAI = require('openai');

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Main function to generate project ideas
async function generateProjectIdeas(jobTitle, jobData) {
    try {
        console.log(`🧠 GPT: Analyzing job market for "${jobTitle}"`);

        // Prepare job data summary for GPT
        const jobSummary = prepareJobSummary(jobTitle, jobData);
        
        // Create the prompt for GPT
        const prompt = createAnalysisPrompt(jobTitle, jobSummary);
        
        // Call OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are Progenix, an AI career assistant specializing in analyzing job market trends and generating practical project ideas that help developers get hired. Always respond with valid JSON in the exact format requested."
                },
                {
                    role: "user", 
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 1500
        });

        const gptResponse = response.choices[0].message.content.trim();
        console.log(`🤖 GPT Response received (${gptResponse.length} chars)`);

        // Parse and validate the JSON response
        const parsedResult = parseGPTResponse(gptResponse);
        
        return parsedResult;

    } catch (error) {
        console.error('❌ GPT Error:', error.message);
        
        // Fallback to a basic response if GPT fails
        return getFallbackResponse(jobTitle);
    }
}

// Helper function to prepare job data summary
function prepareJobSummary(jobTitle, jobData) {
    if (!jobData || jobData.length === 0) {
        return `Limited job data available for ${jobTitle}. Focus on general industry trends.`;
    }

    let summary = `Job Market Analysis for ${jobTitle}:\n\n`;
    
    jobData.forEach((job, index) => {
        summary += `Job ${index + 1}:\n`;
        summary += `- Title: ${job.title}\n`;
        summary += `- Company: ${job.company}\n`;
        summary += `- Description: ${job.description}\n`;
        summary += `- Required Skills: ${job.skills.join(', ')}\n\n`;
    });

    return summary;
}

// Create the analysis prompt for GPT
function createAnalysisPrompt(jobTitle, jobSummary) {
    return `
You're Progenix, an AI career assistant. I need you to analyze job market data and suggest practical project ideas.

${jobSummary}

Based on this data, please:

1. Identify the top 5 most in-demand skills or trends for ${jobTitle} roles
2. Generate exactly 3 project ideas that will help someone get hired in this field

Each project should include:
- Title (creative but professional)
- Description (what problem it solves, why it's valuable)
- Tech Stack (3-6 specific technologies)
- Tasks (list of 5 tasks to complete the project)
- Difficulty (level of difficulty on a scale of 1-5)

Return your response as valid JSON in this exact format:
{
    "insights": ["skill1", "skill2", "skill3", "skill4", "skill5"],
    "projects": [
        {
            "title": "Project Title",
            "description": "Detailed description of what this project does and why it's valuable",
            "techStack": ["Tech1", "Tech2", "Tech3", "Tech4"],
            "tasks": [
                "Task 1: Set up project structure and dependencies",
                "Task 2: Implement core functionality",
                "Task 3: Add user authentication",
                "Task 4: Implement API endpoints",
                "Task 5: Add testing and documentation"
            ],
            "difficulty": 3
        },
        {
            "title": "Project Title 2", 
            "description": "Another project description",
            "techStack": ["Tech1", "Tech2", "Tech3"],
            "tasks": [
                "Task 1: Set up project structure and dependencies",
                "Task 2: Implement core functionality",
                "Task 3: Add user authentication",
                "Task 4: Implement API endpoints",
                "Task 5: Add testing and documentation"
            ],
            "difficulty": 3
        },
        {
            "title": "Project Title 3",
            "description": "Third project description", 
            "techStack": ["Tech1", "Tech2", "Tech3", "Tech4"],
            "tasks": [
                "Task 1: Set up project structure and dependencies",
                "Task 2: Implement core functionality",
                "Task 3: Add user authentication",
                "Task 4: Implement API endpoints",
                "Task 5: Add testing and documentation"
            ],
            "difficulty": 3
        }
    ]
}

Make sure the projects are:
- Practical and achievable
- Directly relevant to ${jobTitle} roles
- Show both technical skills and business value
- Use modern, in-demand technologies
- Solve real-world problems

Return ONLY the JSON, no other text.`;
}

// Parse and validate GPT response
function parseGPTResponse(gptResponse) {
    try {
        // Clean the response (remove any markdown formatting)
        let cleanResponse = gptResponse.trim();
        
        // Remove markdown code blocks if present
        if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanResponse.startsWith('```')) {
            cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
        }
        
        const parsed = JSON.parse(cleanResponse);
        
        // Validate structure
        if (!parsed.insights || !Array.isArray(parsed.insights)) {
            throw new Error('Invalid insights format');
        }
        
        if (!parsed.projects || !Array.isArray(parsed.projects) || parsed.projects.length !== 3) {
            throw new Error('Invalid projects format');
        }
        
        // Validate each project
        parsed.projects.forEach((project, index) => {
            if (!project.title || !project.description || !project.techStack) {
                throw new Error(`Invalid project ${index + 1} format`);
            }
            if (!Array.isArray(project.techStack)) {
                throw new Error(`Invalid tech stack format for project ${index + 1}`);
            }
        });
        
        console.log(`✅ GPT: Successfully parsed ${parsed.projects.length} projects with ${parsed.insights.length} insights`);
        return parsed;
        
    } catch (error) {
        console.error('❌ Failed to parse GPT response:', error.message);
        console.log('Raw response:', gptResponse);
        throw new Error('Invalid GPT response format');
    }
}

// Fallback response if GPT fails
function getFallbackResponse(jobTitle) {
    console.log(`🔄 Using fallback response for: ${jobTitle}`);
    
    const fallbackProjects = {
        "full stack developer": {
            insights: ["React/Vue.js", "Node.js/Express", "Database Design", "API Development", "Cloud Deployment"],
            projects: [
                {
                    title: "E-Commerce Platform with Real-time Features",
                    description: "Build a complete e-commerce solution with user authentication, payment processing, inventory management, and real-time notifications. This showcases full-stack skills and business logic implementation.",
                    techStack: ["React", "Node.js", "MongoDB", "Stripe API", "Socket.io"]
                },
                {
                    title: "Social Media Dashboard with Analytics",
                    description: "Create a social media management tool that aggregates posts, tracks engagement metrics, and provides analytics insights. Demonstrates API integration and data visualization skills.",
                    techStack: ["Vue.js", "Express.js", "PostgreSQL", "Chart.js", "Redis"]
                },
                {
                    title: "Real-time Collaboration Tool",
                    description: "Develop a collaborative workspace like Slack or Discord with real-time messaging, file sharing, and team management features. Shows scalability and real-time architecture knowledge.",
                    techStack: ["React", "Node.js", "WebSocket", "AWS S3", "Docker"]
                }
            ]
        },
        "data scientist": {
            insights: ["Python/R", "Machine Learning", "Data Visualization", "SQL/NoSQL", "Cloud Platforms"],
            projects: [
                {
                    title: "Predictive Analytics for Business Forecasting",
                    description: "Build ML models to predict sales, customer churn, or market trends using historical data. Deploy models as REST APIs for business integration.",
                    techStack: ["Python", "Scikit-learn", "Pandas", "Flask", "AWS"]
                },
                {
                    title: "Real-time Sentiment Analysis System", 
                    description: "Create a system that analyzes social media sentiment in real-time for brand monitoring. Shows NLP skills and real-time data processing.",
                    techStack: ["Python", "NLTK", "Kafka", "MongoDB", "Docker"]
                },
                {
                    title: "Interactive Data Visualization Dashboard",
                    description: "Develop a comprehensive dashboard that transforms complex datasets into interactive visualizations for stakeholder decision-making.",
                    techStack: ["Python", "Plotly", "Streamlit", "PostgreSQL", "Heroku"]
                }
            ]
        }
    };

    // Get specific fallback or use generic
    const normalizedTitle = jobTitle.toLowerCase().trim();
    
    if (fallbackProjects[normalizedTitle]) {
        return fallbackProjects[normalizedTitle];
    }
    
    // Generic fallback
    return {
        insights: ["Problem Solving", "Modern Technologies", "Best Practices", "User Experience", "Performance"],
        projects: [
            {
                title: `Portfolio Website for ${jobTitle}`,
                description: "Create a professional portfolio showcasing your skills, projects, and experience. Include responsive design, performance optimization, and modern development practices.",
                techStack: ["HTML5", "CSS3", "JavaScript", "Git", "Deployment"],
                tasks: [
                    "Set up project structure and version control",
                    "Design responsive layout and user interface",
                    "Implement project showcase and documentation",
                    "Optimize performance and accessibility",
                    "Deploy to production environment"
                ],
                difficulty: 2
            },
            {
                title: `Industry-Specific Tool for ${jobTitle}`,
                description: "Build a specialized tool that solves a common problem in your industry. This demonstrates domain knowledge and practical application of technical skills.",
                techStack: ["Modern Framework", "Database", "API Integration", "Testing"],
                tasks: [
                    "Define problem statement and requirements",
                    "Design system architecture",
                    "Implement core functionality",
                    "Add testing and error handling",
                    "Deploy and document API"
                ],
                difficulty: 3
            },
            {
                title: `Automation Solution for ${jobTitle}`,
                description: "Develop an automation tool that streamlines repetitive tasks in your field. Shows efficiency mindset and technical problem-solving abilities.",
                techStack: ["Scripting Language", "APIs", "Scheduling", "Monitoring"],
                tasks: [
                    "Identify automation opportunities",
                    "Design workflow and data processing",
                    "Implement automation scripts",
                    "Add monitoring and error handling",
                    "Create deployment scripts"
                ],
                difficulty: 3
            }
        ]
    };
}

module.exports = {
    generateProjectIdeas
};
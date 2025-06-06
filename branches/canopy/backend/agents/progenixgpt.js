const OpenAI = require('openai');

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Rate limiter configuration
const rateLimiter = {
  maxRequests: 3, // Maximum requests per minute
  windowMs: 60000, // 1 minute
  lastRequest: 0,
  requestCount: 0
};

// Cache for GPT responses
const gptCache = new Map();

// Function to check rate limit
function checkRateLimit() {
  const now = Date.now();
  if (now - rateLimiter.lastRequest > rateLimiter.windowMs) {
    rateLimiter.requestCount = 0;
    rateLimiter.lastRequest = now;
  }
  if (rateLimiter.requestCount >= rateLimiter.maxRequests) {
    throw new Error('Rate limit exceeded. Please wait a minute before making another request.');
  }
  rateLimiter.requestCount += 1;
}

// Function to get cached response or generate new one
async function getCachedOrGenerate(jobTitle, jobData) {
  const cacheKey = `${jobTitle}-${JSON.stringify(jobData)}`;
  
  if (gptCache.has(cacheKey)) {
    console.log('✅ Using cached GPT response');
    return gptCache.get(cacheKey);
  }
  
  try {
    checkRateLimit();
    const response = await generateProjectIdeas(jobTitle, jobData);
    gptCache.set(cacheKey, response);
    return response;
  } catch (error) {
    console.error('❌ GPT Error:', error.message);
    
    // If we have a cached response, return that instead of falling back
    if (gptCache.has(cacheKey)) {
      console.log('✅ Using previously cached response due to error');
      return gptCache.get(cacheKey);
    }
    
    // If no cached response exists, use fallback
    return getFallbackResponse(jobTitle);
  }
}

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
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are Progenix, an AI career assistant specializing in analyzing job market trends and generating practical project ideas that help developers get hired. Always respond with valid JSON in the exact format requested.'
        },
        {
          role: 'user',
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
  if (!jobData || !jobData.jobs || jobData.jobs.length === 0) {
    return `Limited job data available for ${jobTitle}. Focus on general industry trends.\nTop skills, salary ranges, and locations are unavailable due to insufficient data.`;
  }

  const { jobs, analysis } = jobData;
  let summary = `Job Market Analysis for ${jobTitle}:\n\n`;

  // Add analysis insights
  summary += 'Market Insights:\n';
  summary += `- Total Jobs: ${analysis.totalJobs}\n`;
  summary += `- Top Skills: ${analysis.insights.topSkills.map(s => `${s.skill} (${s.count})`).join(', ')}\n`;
  summary += `- Top Locations: ${analysis.insights.locations.map(l => `${l.location} (${l.count})`).join(', ')}\n`;
  summary += `- Top Companies: ${analysis.insights.companies.map(c => `${c.company} (${c.count})`).join(', ')}\n`;
  summary += `- Salary Ranges: ${analysis.insights.salaryRanges.map(r => `${r.range} (${r.count})`).join(', ')}\n\n`;

  // Add job details
  const sampleJobs = jobs.slice(0, 5);
  sampleJobs.forEach((job, index) => {
    summary += `Job ${index + 1}:\n`;
    summary += `- Title: ${job.title || 'N/A'}\n`;
    summary += `- Company: ${job.company || 'N/A'}\n`;
    summary += `- Location: ${job.location || 'N/A'}\n`;
    summary += `- Description: ${job.description || 'N/A'}\n`;
    summary += `- Required Skills: ${Array.isArray(job.skills) ? job.skills.join(', ') : 'N/A'}\n\n`;
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
    let cleanResponse = gptResponse.trim();
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(cleanResponse);

    if (!parsed.insights || !Array.isArray(parsed.insights)) {
      throw new Error('Invalid insights format');
    }

    if (!parsed.projects || !Array.isArray(parsed.projects) || parsed.projects.length !== 3) {
      throw new Error('Invalid projects format');
    }

    parsed.projects.forEach((project, index) => {
      if (!project.title || !project.description || !project.techStack || !project.tasks || !project.difficulty) {
        throw new Error(`Invalid project ${index + 1} format`);
      }
      if (!Array.isArray(project.techStack) || !Array.isArray(project.tasks)) {
        throw new Error(`Invalid tech stack or tasks format for project ${index + 1}`);
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
    'full stack developer': {
      insights: ['React', 'Node.js', 'Database Design', 'API Development', 'Cloud Deployment'],
      projects: [
        {
          title: 'E-Commerce Platform with Real-time Features',
          description: 'Build a complete e-commerce solution with user authentication, payment processing, inventory management, and real-time notifications. This showcases full-stack skills and business logic implementation.',
          techStack: ['React', 'Node.js', 'MongoDB', 'Stripe API', 'Socket.io'],
          tasks: [
            'Set up project structure and dependencies',
            'Design and implement product catalog',
            'Integrate payment processing with Stripe',
            'Add real-time notifications with Socket.io',
            'Write tests and deploy to cloud'
          ],
          difficulty: 3
        },
        {
          title: 'Social Media Dashboard',
          description: 'Create a real-time dashboard that aggregates data from multiple social media platforms, providing analytics and insights for social media managers.',
          techStack: ['React', 'Node.js', 'Express', 'Socket.io', 'Chart.js'],
          tasks: [
            'Set up authentication and API integration',
            'Design responsive dashboard layout',
            'Implement real-time data streaming',
            'Create analytics visualizations',
            'Add user customization features'
          ],
          difficulty: 3
        },
        {
          title: 'Task Management System with AI Integration',
          description: 'Develop a task management application with AI-powered task suggestions and natural language processing for task creation.',
          techStack: ['React', 'Node.js', 'MongoDB', 'OpenAI API', 'Natural Language Processing'],
          tasks: [
            'Set up project structure and database',
            'Implement task management features',
            'Integrate OpenAI API for task suggestions',
            'Add natural language processing',
            'Create user interface'
          ],
          difficulty: 4
        }
      ]
    },
    'backend developer': {
      insights: ['Node.js', 'Python', 'Database Optimization', 'API Design', 'Cloud Architecture'],
      projects: [
        {
          title: 'Microservices Architecture Implementation',
          description: 'Design and implement a microservices-based system with service discovery, load balancing, and distributed database management.',
          techStack: ['Node.js', 'Docker', 'Kubernetes', 'RabbitMQ', 'PostgreSQL'],
          tasks: [
            'Set up microservices architecture',
            'Implement service discovery',
            'Configure load balancing',
            'Set up database replication',
            'Create API documentation'
          ],
          difficulty: 4
        },
        {
          title: 'Real-time Analytics Platform',
          description: 'Build a platform that processes and analyzes streaming data in real-time, providing insights and alerts.',
          techStack: ['Node.js', 'Apache Kafka', 'Elasticsearch', 'Kibana', 'Redis'],
          tasks: [
            'Set up data streaming pipeline',
            'Implement real-time processing',
            'Create visualization dashboard',
            'Add alerting system',
            'Optimize performance'
          ],
          difficulty: 4
        },
        {
          title: 'Distributed File System',
          description: 'Develop a distributed file system with fault tolerance, data replication, and efficient file access.',
          techStack: ['Python', 'gRPC', 'Consul', 'Cassandra', 'Nginx'],
          tasks: [
            'Design distributed architecture',
            'Implement file storage',
            'Add data replication',
            'Create API endpoints',
            'Test fault tolerance'
          ],
          difficulty: 5
        }
      ]
    },
    'frontend developer': {
      insights: ['React', 'Vue.js', 'UI/UX Design', 'Performance Optimization', 'Accessibility'],
      projects: [
        {
          title: 'Portfolio Website with Interactive Features',
          description: 'Create a modern, responsive portfolio website with interactive animations and performance optimization.',
          techStack: ['React', 'TypeScript', 'Three.js', 'Tailwind CSS', 'GSAP'],
          tasks: [
            'Set up project structure',
            'Design responsive layout',
            'Add interactive animations',
            'Optimize performance',
            'Add dark mode'
          ],
          difficulty: 3
        },
        {
          title: 'E-Commerce Product Catalog',
          description: 'Build a product catalog with advanced filtering, search, and responsive design.',
          techStack: ['Vue.js', 'Nuxt.js', 'GraphQL', 'Tailwind CSS', 'Algolia'],
          tasks: [
            'Set up project structure',
            'Implement product filtering',
            'Add search functionality',
            'Create responsive design',
            'Optimize performance'
          ],
          difficulty: 3
        },
        {
          title: 'Real-time Chat Application',
          description: 'Develop a real-time chat application with features like typing indicators, message reactions, and file sharing.',
          techStack: ['React', 'Socket.io', 'Redux', 'Material-UI', 'Firebase'],
          tasks: [
            'Set up real-time communication',
            'Implement chat features',
            'Add UI components',
            'Optimize performance',
            'Add security features'
          ],
          difficulty: 3
        }
      ]
    },
    'mobile developer': {
      insights: ['React Native', 'Swift', 'Android Development', 'Cross-platform', 'Performance Optimization'],
      projects: [
        {
          title: 'Food Delivery App',
          description: 'Create a food delivery application with real-time order tracking and payment integration.',
          techStack: ['React Native', 'Firebase', 'Stripe API', 'Google Maps API', 'Redux'],
          tasks: [
            'Set up project structure',
            'Implement food ordering',
            'Add payment integration',
            'Create real-time tracking',
            'Optimize performance'
          ],
          difficulty: 3
        },
        {
          title: 'Social Media App',
          description: 'Build a social media application with features like posts, comments, likes, and real-time notifications.',
          techStack: ['React Native', 'Node.js', 'MongoDB', 'Socket.io', 'Expo'],
          tasks: [
            'Set up authentication',
            'Implement social features',
            'Add real-time updates',
            'Create UI components',
            'Optimize performance'
          ],
          difficulty: 3
        },
        {
          title: 'Health Tracking App',
          description: 'Develop a health tracking application that monitors fitness activities and provides insights.',
          techStack: ['React Native', 'HealthKit', 'Google Fit', 'Firebase', 'Charts'],
          tasks: [
            'Set up health tracking',
            'Implement data visualization',
            'Add notifications',
            'Create dashboard',
            'Optimize performance'
          ],
          difficulty: 3
        }
      ]
    },
    default: {
      insights: ['Problem Solving', 'Modern Technologies', 'Best Practices', 'User Experience', 'Performance'],
      projects: [
        {
          title: `Portfolio Website for ${jobTitle}`,
          description: 'Create a professional portfolio showcasing your skills, projects, and experience. Include responsive design, performance optimization, and modern development practices.',
          techStack: ['HTML5', 'CSS3', 'JavaScript', 'Git', 'Deployment'],
          tasks: [
            'Set up project structure and version control',
            'Design responsive layout and user interface',
            'Implement project showcase and documentation',
            'Optimize performance and accessibility',
            'Deploy to production environment'
          ],
          difficulty: 2
        },
        {
          title: `Personal Blog for ${jobTitle}`,
          description: `Build a personal blog that showcases your writing skills and technical expertise in ${jobTitle}.`,
          techStack: ['React', 'Node.js', 'MongoDB', 'Markdown', 'SEO'],
          tasks: [
            'Set up blog structure',
            'Implement content management',
            'Add SEO optimization',
            'Create responsive design',
            'Deploy to production'
          ],
          difficulty: 2
        },
        {
          title: `Automation Tool for ${jobTitle}`,
          description: `Create an automation tool that helps streamline common tasks in ${jobTitle} roles.`,
          techStack: ['Python', 'Node.js', 'API Integration', 'Task Scheduling', 'Database'],
          tasks: [
            'Set up project structure',
            'Implement core functionality',
            'Add task scheduling',
            'Create user interface',
            'Test and optimize'
          ],
          difficulty: 3
        }
      ]
    }
  };

  const normalizedTitle = jobTitle.toLowerCase().trim();
  return fallbackProjects[normalizedTitle] || fallbackProjects.default;
}

module.exports = {
  generateProjectIdeas,
  getCachedOrGenerate
};
// Progenix Frontend Script
let isGenerating = false;

async function generateProjects() {
    // Check if we have canopy access cookie
    const cookies = document.cookie.split('; ').map(c => c.trim());
    const hasAccess = cookies.some(cookie => cookie.startsWith('canopyAccess='));
    
    if (!hasAccess) {
        // Try to get the cookie from the response headers
        const response = await fetch('/api/canopy/auth/check-access', {
            credentials: 'include'
        });
        
        if (!response.ok) {
            showError('Access denied. Please log in to Canopy first.');
            return;
        }
    }

    const jobTitle = document.getElementById('jobTitle').value.trim();
    const startBtn = document.querySelector('.start-btn');
    const loading = document.getElementById('loading');
    const results = document.getElementById('results');
    const error = document.getElementById('error');

    // Validation
    if (!jobTitle) {
        showError('Please enter a job title or role');
        return;
    }

    if (isGenerating) {
        return;
    }

    // Reset UI
    hideError();
    hideResults();
    
    // Show loading state
    showLoading();
    isGenerating = true;
    startBtn.disabled = true;
    startBtn.textContent = '🔄 Generating...';

    try {
        // Call backend API
        const response = await fetch('/api/canopy/progenix/generate', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                jobTitle: jobTitle
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to generate projects');
        }

        // Display results
        displayProjects(data.projects, data.insights);
    } catch (err) {
        console.error('Error generating projects:', err);
        showError(err.message || 'Failed to generate projects. Please try again.');
    } finally {
        // Reset UI state
        hideLoading();
        isGenerating = false;
        startBtn.disabled = false;
        startBtn.textContent = '🚀 Generate Projects';
    }
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showResults() {
    document.getElementById('results').style.display = 'block';
}

function hideResults() {
    document.getElementById('results').style.display = 'none';
}

function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

function displayProjects(projects, insights) {
    // Display job market analysis
    const totalJobsElement = document.getElementById('total-jobs');
    if (totalJobsElement) {
        totalJobsElement.textContent = insights?.totalJobs || 0;
    }

    // Display top skills
    const topSkillsElement = document.getElementById('top-skills');
    if (topSkillsElement && insights?.topSkills) {
        topSkillsElement.innerHTML = insights.topSkills.map(skill => `
            <span class="skill-tag">${skill.skill} (${skill.count})</span>
        `).join('');
    }

    // Display salary ranges
    const salaryRangesElement = document.getElementById('salary-ranges');
    if (salaryRangesElement && insights?.salaryRanges) {
        salaryRangesElement.innerHTML = insights.salaryRanges.map(range => `
            <div class="stat-item">
                <span>${range.range}</span>
                <span>${range.count} jobs</span>
            </div>
        `).join('');
    }

    // Display locations
    const locationsElement = document.getElementById('locations');
    if (locationsElement && insights?.locations) {
        locationsElement.innerHTML = Object.entries(insights.locations)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([location, count]) => `
                <div class="stat-item">
                    <span>${location}</span>
                    <span>${count} jobs</span>
                </div>
            `).join('');
    }

    // Display companies
    const companiesElement = document.getElementById('companies');
    if (companiesElement && insights?.companies) {
        companiesElement.innerHTML = Object.entries(insights.companies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([company, count]) => `
                <div class="stat-item">
                    <span>${company}</span>
                    <span>${count} jobs</span>
                </div>
            `).join('');
    }

    // Display sample jobs
    const jobListElement = document.getElementById('job-list');
    if (jobListElement && insights?.sampleJobs) {
        jobListElement.innerHTML = insights.sampleJobs.map(job => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p><strong>Location:</strong> ${job.location}</p>
                <div class="skills">
                    ${job.skills.map(skill => `
                        <span class="job-skill">${skill}</span>
                    `).join('')}
                </div>
                <p>${job.description}</p>
            </div>
        `).join('');
    }

    // Display projects
    const projectsContainer = document.getElementById('projects-container');
    if (projectsContainer) {
        projectsContainer.innerHTML = '';
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            projectCard.innerHTML = `
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <div class="tech-stack">
                    ${project.techStack.map(tech => `
                        <span class="tech-tag">${tech}</span>
                    `).join('')}
                </div>
            `;

            projectsContainer.appendChild(projectCard);
        });
    }

    showResults();
}

// Smooth scroll to results
function scrollToResults() {
    document.getElementById('results').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
    });
}

// Allow Enter key to trigger generation
document.getElementById('jobTitle').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        generateProjects();
    }
});

// Auto-focus on input when page loads
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('jobTitle').focus();
});

// Add some example suggestions
const examples = [
    "Full Stack Developer",
    "Data Scientist", 
    "Product Manager",
    "DevOps Engineer",
    "UX Designer",
    "Mobile App Developer",
    "Machine Learning Engineer",
    "Cybersecurity Specialist"
];

// Add click-to-fill functionality for quick testing
document.getElementById('jobTitle').addEventListener('focus', function() {
    if (!this.value) {
        this.placeholder = `Try: ${examples[Math.floor(Math.random() * examples.length)]}`;
    }
});
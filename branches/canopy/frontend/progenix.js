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
    const projectsList = document.getElementById('projectsList');
    
    let html = '';
    
    // Add insights section if available
    if (insights && insights.length > 0) {
        html += `
            <div class="insights-section" style="margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #4facfe10, #00f2fe10); border-radius: 15px;">
                <h3 style="color: #4facfe; margin-bottom: 15px;">🔍 Market Insights</h3>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    ${insights.map(insight => `<span class="tech-tag">${insight}</span>`).join('')}
                </div>
            </div>
        `;
    }
    
    // Add projects
    projects.forEach((project, index) => {
        html += `
            <div class="project-card">
                <div class="project-title">${project.title}</div>
                <div class="project-description">${project.description}</div>
                <div style="margin-top: 15px;">
                    <strong style="color: #333; display: block; margin-bottom: 8px;">Recommended Tech Stack:</strong>
                    <div class="tech-stack">
                        ${project.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    });
    
    projectsList.innerHTML = html;
    showResults();
    
    // Smooth scroll to results
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
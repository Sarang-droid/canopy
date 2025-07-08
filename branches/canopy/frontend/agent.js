/**
 * Agent Dashboard - Search Functionality
 * Provides real-time search across all agents and their roles
 * Author: Canopy Development Team
 * Version: 1.0.0
 * 
 * This file contains ONLY JavaScript functionality for search features.
 * Include this file in your HTML dashboard for enhanced search capabilities.
 */

class AgentSearch {
    constructor() {
        this.searchInput = null;
        this.agentCards = [];
        this.allAgents = [];
        this.searchResults = [];
        this.currentFilter = 'all';
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    /**
     * Initialize the search functionality
     */
    init() {
        try {
            this.setupElements();
            this.extractAgentData();
            this.bindEvents();
            this.setupAgentLinks();
            console.log('Agent Search initialized successfully');
        } catch (error) {
            console.error('Error initializing Agent Search:', error);
        }
    }

    /**
     * Setup DOM element references
     */
    setupElements() {
        this.searchInput = document.querySelector('.search-input');
        this.agentCards = Array.from(document.querySelectorAll('.agent-card'));
        this.noResultsElement = this.createNoResultsElement();
        
        if (!this.searchInput) {
            throw new Error('Search input not found');
        }
    }

    /**
     * Extract agent data from DOM elements
     */
    extractAgentData() {
        if (this.agentCards.length === 0) {
            throw new Error('No agent cards found');
        }

        this.allAgents = this.agentCards.map(card => {
            const title = card.querySelector('.agent-title')?.textContent.trim() || '';
            const role = card.querySelector('.agent-role')?.textContent.trim() || '';
            const description = card.querySelector('.agent-description')?.textContent.trim() || '';
            const category = ['technical', 'financial', 'canopy', 'universal']
                .find(cls => card.classList.contains(cls)) || 'other';

            const agentElements = card.querySelectorAll('.agent');
            const agents = Array.from(agentElements).map(el => {
                const agentText = el.textContent.trim();
                const [name, description = ''] = agentText.split(' - ');
                const href = el.getAttribute('href');
                return {
                    name: name.trim(),
                    description: description.trim(),
                    element: el,
                    href: href || null
                };
            });

            return {
                title,
                role,
                description,
                category,
                element: card,
                agents,
                searchableText: this.createSearchableText(category, agents)
            };
        });
        console.log('Extracted agent data:', this.allAgents);
    }

    /**
     * Create searchable text from agent category and agents
     * @param {string} category - Agent category
     * @param {Array} agents - Array of agent objects
     * @returns {string} Searchable text
     */
    createSearchableText(category, agents) {
        const agentText = agents.map(agent => `${agent.name} ${agent.description}`).join(' ');
        return `${category} ${agentText}`.toLowerCase();
    }

    /**
     * Create no results message element
     * @returns {HTMLElement} No results element
     */
    createNoResultsElement() {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.style.cssText = `
            text-align: center;
            padding: 2rem;
            color: #6c757d;
            font-size: 1.1rem;
            display: none;
        `;
        noResults.textContent = 'No agents found matching your search.';
        
        const container = document.querySelector('.main-content');
        if (container) {
            container.insertBefore(noResults, container.firstChild);
        } else {
            console.warn('Main content container not found; no-results element not inserted');
        }
        
        return noResults;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Filter change handlers
        document.querySelectorAll('input[name="filter"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentFilter = e.target.id;
                this.handleSearch(this.searchInput.value);
            });
        });
    }

    /**
     * Setup agent link click handlers
     */
    setupAgentLinks() {
        document.querySelectorAll('.agent').forEach(agent => {
            if (agent.tagName === 'A') {
                agent.addEventListener('click', (e) => {
                    if (this.searchInput.value.trim()) {
                        e.preventDefault();
                        this.searchInput.value = '';
                        setTimeout(() => agent.click(), 100);
                    }
                });
            }
        });
    }

    /**
     * Handle search input
     * @param {string} query - Search query
     */
    handleSearch(query) {
        query = query.toLowerCase().trim();
        
        // Reset all cards to visible
        this.agentCards.forEach(card => {
            card.style.display = '';
        });

        // Reset no results message
        if (this.noResultsElement) {
            this.noResultsElement.style.display = 'none';
        }

        // If query is empty, show all
        if (!query) {
            return;
        }

        // Filter and search
        const results = this.allAgents.filter(agentGroup => 
            (this.currentFilter === 'all' || agentGroup.category === this.currentFilter) &&
            agentGroup.searchableText.includes(query)
        );

        // Update visibility
        this.agentCards.forEach(card => {
            const agentGroup = this.allAgents.find(group => group.element === card);
            card.style.display = agentGroup && results.includes(agentGroup) ? '' : 'none';
        });

        // Show no results message if needed
        if (results.length === 0 && this.noResultsElement) {
            this.noResultsElement.style.display = 'block';
        }
    }

    /**
     * Find specific agent by name
     * @param {string} agentName - Name of the agent to find
     * @returns {Object|null} Agent object or null if not found
     */
    findAgent(agentName) {
        return this.allAgents.flatMap(group => group.agents)
            .find(agent => agent.name.toLowerCase() === agentName.toLowerCase()) || null;
    }

    /**
     * Find agents by role
     * @param {string} role - Role to search for
     * @returns {Array} Array of matching agent objects
     */
    findAgentsByRole(role) {
        return this.allAgents.flatMap(group => group.agents)
            .filter(agent => agent.description.toLowerCase().includes(role.toLowerCase()));
    }

    /**
     * Get all agents as flat array
     * @returns {Array} Array of all agent objects
     */
    getAllAgents() {
        return this.allAgents.flatMap(group => group.agents);
    }

    /**
     * Generate search suggestions
     * @param {string} query - Search query
     * @returns {Array} Array of suggestion strings
     */
    generateSuggestions(query) {
        query = query.toLowerCase().trim();
        const allText = this.allAgents.flatMap(group => [
            group.category.toLowerCase(),
            ...group.agents.map(agent => `${agent.name.toLowerCase()} ${agent.description.toLowerCase()}`)
        ]);
        const suggestions = allText.filter(text => text.includes(query)).slice(0, 5);
        console.log('Search suggestions:', suggestions);
        return suggestions;
    }
}

// Initialize the search functionality
const agentSearch = new AgentSearch();

// Add search highlight styles
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .search-highlight {
        background-color: #ffffcc;
        padding: 0 2px;
    }
    .no-results {
        text-align: center;
        padding: 2rem;
        color: #6c757d;
        font-size: 1.1rem;
    }
`;
document.head.appendChild(searchStyles);

console.log('Agent.js loaded successfully! 🌟');
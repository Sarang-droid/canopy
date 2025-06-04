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
            this.setupFilterTracking();
            console.log('Agent Search initialized successfully');
        } catch (error) {
            console.error('Error initializing Agent Search:', error);
        }
    }

    /**
     * Setup DOM elements references
     */
    setupElements() {
        this.searchInput = document.querySelector('.search-input');
        this.agentCards = Array.from(document.querySelectorAll('.agent-card'));
        this.noResultsElement = this.createNoResultsElement();
        
        if (!this.searchInput) {
            throw new Error('Search input element not found');
        }
        
        if (this.agentCards.length === 0) {
            throw new Error('No agent cards found');
        }
    }

    /**
     * Extract agent data from DOM
     */
    extractAgentData() {
        this.allAgents = this.agentCards.map(card => {
            const titleElement = card.querySelector('.agent-title');
            const agentElements = card.querySelectorAll('.agent');
            const agentClass = this.getAgentClass(card);
            
            const agentCategory = titleElement ? 
                titleElement.textContent.trim().replace(/Agents$/, '').trim() : 
                'Unknown Category';
            
            const agents = Array.from(agentElements).map(el => {
                const agentText = el.textContent.trim();
                const [name, role] = agentText.split(' - ');
                return {
                    name: name.trim(),
                    role: role.trim(),
                    element: el
                };
            });

            return {
                element: card,
                category: agentCategory,
                agents: agents,
                class: agentClass,
                searchableText: this.createSearchableText(agentCategory, agents)
            };
        });

        console.log('Extracted agent data:', this.allAgents);
    }

    /**
     * Get the agent class (technical, financial, etc.)
     */
    getAgentClass(card) {
        const classes = ['technical', 'financial', 'marketing', 'legal', 'project', 'canopy'];
        return classes.find(cls => card.classList.contains(cls)) || 'unknown';
    }

    /**
     * Create searchable text from agent category and agents
     */
    createSearchableText(category, agents) {
        const agentText = agents.map(agent => `${agent.name} ${agent.role}`).join(' ');
        return [category, agentText].join(' ').toLowerCase();
    }

    /**
     * Create no results message element
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
     * Handle search input
     */
    handleSearch(query) {
        query = query.toLowerCase().trim();
        
        // Reset all cards to visible
        this.agentCards.forEach(card => {
            card.style.display = '';
        });

        // Reset no results message
        this.noResultsElement.style.display = 'none';

        // If query is empty, show all
        if (!query) {
            return;
        }

        // Filter and search
        const results = this.allAgents.filter(agentGroup => {
            // Apply category filter
            if (this.currentFilter !== 'all' && agentGroup.class !== this.currentFilter) {
                return false;
            }

            // Search in category name and agents
            return agentGroup.searchableText.includes(query);
        });

        // Update visibility
        this.agentCards.forEach(card => {
            const agentGroup = this.allAgents.find(group => group.element === card);
            if (agentGroup && results.includes(agentGroup)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });

        // Show no results message if needed
        if (results.length === 0) {
            this.noResultsElement.style.display = 'block';
        }
    }

    /**
     * Setup filter tracking
     */
    setupFilterTracking() {
        // Add filter change handler
        document.querySelectorAll('input[name="filter"]').forEach(radio => {
            radio.addEventListener('change', () => {
                this.handleSearch(this.searchInput.value);
            });
        });
    }

    /**
     * Find specific agent by name
     * @param {string} agentName - Name of the agent to find
     */
    findAgent(agentName) {
        return this.allAgents.flatMap(group => group.agents)
            .find(agent => agent.name.toLowerCase() === agentName.toLowerCase());
    }

    /**
     * Find agents by role
     * @param {string} role - Role to search for
     */
    findAgentsByRole(role) {
        return this.allAgents.flatMap(group => group.agents)
            .filter(agent => agent.role.toLowerCase().includes(role.toLowerCase()));
    }

    /**
     * Get all agents as flat array
     */
    getAllAgents() {
        return this.allAgents.flatMap(group => group.agents);
    }

    /**
     * Search with suggestions
     * @param {string} query - Search query
     */
    searchWithSuggestions(query) {
        query = query.toLowerCase();
        const allText = this.allAgents.flatMap(group => [
            group.category.toLowerCase(),
            ...group.agents.map(agent => `${agent.name.toLowerCase()} ${agent.role.toLowerCase()}`)
        ]);

        return allText.filter(text => text.includes(query)).slice(0, 5);
    }

    /**
     * Generate search suggestions
     * @param {string} query - Search query
     */
    generateSuggestions(query) {
        const suggestions = this.searchWithSuggestions(query);
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
console.log('Available methods:', Object.keys(window.AgentSearch));
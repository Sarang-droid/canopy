/**
 * Canopy Branch Dashboard - Search Functionality
 * Provides real-time search across all branches and sub-branches
 * Author: Canopy Development Team
 * Version: 1.0.0
 * 
 * This file contains ONLY JavaScript functionality for search features.
 * Include this file in your HTML dashboard for enhanced search capabilities.
 */

class CanopySearch {
    constructor() {
        this.searchInput = null;
        this.branchCards = [];
        this.allBranches = [];
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
            this.extractBranchData();
            this.bindEvents();
            this.setupFilterTracking();
            console.log('Canopy Search initialized successfully');
        } catch (error) {
            console.error('Error initializing Canopy Search:', error);
        }
    }

    /**
     * Setup DOM elements references
     */
    setupElements() {
        this.searchInput = document.querySelector('.search-input');
        this.branchCards = Array.from(document.querySelectorAll('.branch-card'));
        this.noResultsElement = this.createNoResultsElement();
        
        if (!this.searchInput) {
            throw new Error('Search input element not found');
        }
        
        if (this.branchCards.length === 0) {
            throw new Error('No branch cards found');
        }
    }

    /**
     * Extract branch and sub-branch data from DOM
     */
    extractBranchData() {
        this.allBranches = this.branchCards.map(card => {
            const titleElement = card.querySelector('.branch-title');
            const subBranchElements = card.querySelectorAll('.sub-branch');
            const branchClass = this.getBranchClass(card);
            
            const branchName = titleElement ? 
                titleElement.textContent.trim().replace(/Branch$/, '').trim() : 
                'Unknown Branch';
            
            const subBranches = Array.from(subBranchElements).map(el => 
                el.textContent.trim()
            );

            return {
                element: card,
                name: branchName,
                subBranches: subBranches,
                class: branchClass,
                searchableText: this.createSearchableText(branchName, subBranches)
            };
        });

        console.log('Extracted branch data:', this.allBranches);
    }

    /**
     * Get the branch class (technical, financial, etc.)
     */
    getBranchClass(card) {
        const classes = ['technical', 'financial', 'marketing', 'legal', 'project', 'canopy'];
        return classes.find(cls => card.classList.contains(cls)) || 'unknown';
    }

    /**
     * Create searchable text from branch name and sub-branches
     */
    createSearchableText(branchName, subBranches) {
        return [branchName, ...subBranches].join(' ').toLowerCase();
    }

    /**
     * Create "No Results" element
     */
    createNoResultsElement() {
        const noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.innerHTML = `
            <div class="no-results-content">
                <i class="fas fa-search no-results-icon"></i>
                <h3>No Results Found</h3>
                <p>Try searching with different keywords or check your spelling.</p>
                <button class="clear-search-btn" onclick="canopySearch.clearSearch()">
                    Clear Search
                </button>
            </div>
        `;
        noResults.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem 2rem;
            background: white;
            border-radius: 20px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            margin: 2rem 0;
            display: none;
        `;
        
        // Add styles for no-results content
        const style = document.createElement('style');
        style.textContent = `
            .no-results-content h3 {
                color: #6c757d;
                margin: 1rem 0 0.5rem;
                font-size: 1.5rem;
            }
            .no-results-content p {
                color: #adb5bd;
                margin-bottom: 1.5rem;
            }
            .no-results-icon {
                font-size: 3rem;
                color: #dee2e6;
            }
            .clear-search-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 25px;
                cursor: pointer;
                font-family: 'Poppins', sans-serif;
                font-weight: 500;
                transition: all 0.3s ease;
            }
            .clear-search-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
        `;
        document.head.appendChild(style);
        
        return noResults;
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Real-time search as user types
        this.searchInput.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });

        // Handle Enter key for search
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.performSearch(e.target.value);
            }
        });

        // Clear search on Escape key
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
        });

        // Handle search input focus/blur for enhanced UX
        this.searchInput.addEventListener('focus', () => {
            this.searchInput.parentElement.classList.add('search-focused');
        });

        this.searchInput.addEventListener('blur', () => {
            this.searchInput.parentElement.classList.remove('search-focused');
        });
    }

    /**
     * Setup filter tracking to work with search
     */
    setupFilterTracking() {
        const filterRadios = document.querySelectorAll('input[name="filter"]');
        
        filterRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentFilter = e.target.id;
                // Re-run search with current query when filter changes
                this.performSearch(this.searchInput.value);
            });
        });
    }

    /**
     * Perform search across all branches and sub-branches
     */
    performSearch(query) {
        const searchTerm = query.trim().toLowerCase();
        
        // If empty search, show all cards based on current filter
        if (!searchTerm) {
            this.showAllCards();
            this.hideNoResults();
            this.clearHighlights();
            return;
        }

        // Search through branches
        this.searchResults = this.allBranches.filter(branch => {
            return this.matchesSearch(branch, searchTerm);
        });

        // Apply current filter to search results
        if (this.currentFilter !== 'all') {
            this.searchResults = this.searchResults.filter(branch => 
                branch.class === this.currentFilter
            );
        }

        // Display results
        this.displaySearchResults(searchTerm);
        
        // Log search activity
        console.log(`Search: "${query}" - Found ${this.searchResults.length} results`);
    }

    /**
     * Check if branch matches search term
     */
    matchesSearch(branch, searchTerm) {
        // Check branch name
        if (branch.name.toLowerCase().includes(searchTerm)) {
            return true;
        }

        // Check sub-branches
        return branch.subBranches.some(subBranch => 
            subBranch.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Display search results
     */
    displaySearchResults(searchTerm) {
        // Hide all cards first
        this.branchCards.forEach(card => {
            card.style.display = 'none';
        });

        if (this.searchResults.length === 0) {
            this.showNoResults();
            return;
        }

        this.hideNoResults();

        // Show matching cards and highlight matches
        this.searchResults.forEach(branch => {
            branch.element.style.display = 'block';
            this.highlightMatches(branch.element, searchTerm);
            
            // Auto-expand details if sub-branch matches
            this.autoExpandIfSubBranchMatches(branch, searchTerm);
        });

        // Smooth scroll to first result
        if (this.searchResults.length > 0) {
            setTimeout(() => {
                this.searchResults[0].element.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 100);
        }
    }

    /**
     * Highlight search matches in text
     */
    highlightMatches(cardElement, searchTerm) {
        // Clear previous highlights
        this.clearHighlights(cardElement);

        // Highlight in branch title
        const titleElement = cardElement.querySelector('.branch-title');
        if (titleElement) {
            this.highlightText(titleElement, searchTerm);
        }

        // Highlight in sub-branches
        const subBranchElements = cardElement.querySelectorAll('.sub-branch');
        subBranchElements.forEach(element => {
            this.highlightText(element, searchTerm);
        });
    }

    /**
     * Highlight specific text in an element
     */
    highlightText(element, searchTerm) {
        const text = element.textContent;
        const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
        const highlightedText = text.replace(regex, '<mark class="search-highlight">$1</mark>');
        
        if (highlightedText !== text) {
            element.innerHTML = highlightedText;
        }
    }

    /**
     * Auto-expand details if sub-branch matches search
     */
    autoExpandIfSubBranchMatches(branch, searchTerm) {
        const hasSubBranchMatch = branch.subBranches.some(subBranch => 
            subBranch.toLowerCase().includes(searchTerm)
        );

        if (hasSubBranchMatch) {
            const detailsElement = branch.element.querySelector('.branch-details');
            if (detailsElement) {
                detailsElement.open = true;
            }
        }
    }

    /**
     * Show all cards based on current filter
     */
    showAllCards() {
        this.branchCards.forEach(card => {
            if (this.currentFilter === 'all') {
                card.style.display = 'block';
            } else {
                card.style.display = card.classList.contains(this.currentFilter) ? 'block' : 'none';
            }
        });
    }

    /**
     * Show no results message
     */
    showNoResults() {
        const grid = document.querySelector('.branch-grid');
        if (grid && !grid.contains(this.noResultsElement)) {
            grid.appendChild(this.noResultsElement);
        }
        this.noResultsElement.style.display = 'block';
    }

    /**
     * Hide no results message
     */
    hideNoResults() {
        this.noResultsElement.style.display = 'none';
    }

    /**
     * Clear all search highlights
     */
    clearHighlights(container = document) {
        const highlights = container.querySelectorAll('.search-highlight');
        highlights.forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
    }

    /**
     * Clear search and reset view
     */
    clearSearch() {
        this.searchInput.value = '';
        this.searchInput.focus();
        this.showAllCards();
        this.hideNoResults();
        this.clearHighlights();
        
        // Close all expanded details
        const allDetails = document.querySelectorAll('.branch-details');
        allDetails.forEach(details => {
            details.open = false;
        });
    }

    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Get search statistics
     */
    getSearchStats() {
        return {
            totalBranches: this.allBranches.length,
            totalSubBranches: this.allBranches.reduce((total, branch) => 
                total + branch.subBranches.length, 0
            ),
            currentResults: this.searchResults.length,
            currentFilter: this.currentFilter
        };
    }

    /**
     * Advanced search with multiple terms
     */
    advancedSearch(query) {
        const terms = query.toLowerCase().split(/\s+/).filter(term => term.length > 0);
        
        if (terms.length === 0) {
            this.showAllCards();
            return;
        }

        this.searchResults = this.allBranches.filter(branch => {
            return terms.every(term => branch.searchableText.includes(term));
        });

        this.displaySearchResults(query);
    }

    /**
     * Export search results
     */
    exportSearchResults(format = 'json') {
        const results = this.searchResults.map(branch => ({
            name: branch.name,
            class: branch.class,
            subBranches: branch.subBranches
        }));

        if (format === 'json') {
            return JSON.stringify(results, null, 2);
        } else if (format === 'csv') {
            let csv = 'Branch Name,Class,Sub-Branches\n';
            results.forEach(branch => {
                csv += `"${branch.name}","${branch.class}","${branch.subBranches.join('; ')}"\n`;
            });
            return csv;
        }
        
        return results;
    }
}

// Add search highlight styles
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .search-highlight {
        background: linear-gradient(135deg, #fff3cd, #ffeaa7);
        color: #856404;
        padding: 0.1rem 0.2rem;
        border-radius: 3px;
        font-weight: 600;
    }
    
    .search-focused {
        transform: scale(1.02);
        transition: transform 0.3s ease;
    }
    
    .branch-card.search-result {
        border-left: 4px solid #667eea;
        animation: searchResultPulse 1s ease-in-out;
    }
    
    @keyframes searchResultPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
`;
document.head.appendChild(searchStyles);

// Initialize Canopy Search
const canopySearch = new CanopySearch();

// Export for global access
window.canopySearch = canopySearch;

// Additional utility functions
window.CanopyUtils = {
    /**
     * Search for specific branch by name
     */
    findBranch: (branchName) => {
        return canopySearch.allBranches.find(branch => 
            branch.name.toLowerCase().includes(branchName.toLowerCase())
        );
    },

    /**
     * Search for branches containing specific sub-branch
     */
    findBranchBySubBranch: (subBranchName) => {
        return canopySearch.allBranches.filter(branch =>
            branch.subBranches.some(sub => 
                sub.toLowerCase().includes(subBranchName.toLowerCase())
            )
        );
    },

    /**
     * Get all sub-branches as flat array
     */
    getAllSubBranches: () => {
        return canopySearch.allBranches.flatMap(branch => 
            branch.subBranches.map(sub => ({
                subBranch: sub,
                parentBranch: branch.name,
                class: branch.class
            }))
        );
    },

    /**
     * Search with suggestions
     */
    searchWithSuggestions: (query) => {
        const results = canopySearch.performSearch(query);
        const suggestions = CanopyUtils.generateSuggestions(query);
        return { results, suggestions };
    },

    /**
     * Generate search suggestions
     */
    generateSuggestions: (query) => {
        const allTerms = canopySearch.allBranches.flatMap(branch => [
            branch.name,
            ...branch.subBranches
        ]);
        
        const suggestions = allTerms.filter(term => 
            term.toLowerCase().includes(query.toLowerCase()) && 
            term.toLowerCase() !== query.toLowerCase()
        );
        
        return [...new Set(suggestions)].slice(0, 5);
    }
};

console.log('Canopy.js loaded successfully! 🌳');
console.log('Available methods:', Object.keys(window.CanopyUtils));
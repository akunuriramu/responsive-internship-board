/**
 * Responsive Internship Board - script.js
 * Vanilla JavaScript Implementation
 * Handles dynamic data loading, filtering, search, and state management.
 */

// Encapsulate in IIFE to keep global namespace clean
(() => {
  'use strict';

  // --- State Management ---
  const state = {
    internships: [],
    isLoading: true,
    hasError: false,
    errorMessage: '',
    filters: {
      searchTerm: '',
      domain: 'all'
    }
  };

  // --- DOM Element References ---
  const elements = {
    // Form & Filter Controls
    filterForm: document.getElementById('filter-form'),
    searchInput: document.getElementById('search-input'),
    searchClearBtn: document.getElementById('search-clear-btn'),
    domainSelect: document.getElementById('domain-select'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    
    // Status & Count Display
    resultsCount: document.getElementById('results-count'),
    activeFilterTags: document.getElementById('active-filter-tags'),
    
    // Containers & States
    grid: document.getElementById('internships-grid'),
    loadingState: document.getElementById('loading-state'),
    emptyState: document.getElementById('empty-state'),
    errorState: document.getElementById('error-state'),
    errorMessage: document.getElementById('error-message'),
    
    // Action Buttons
    emptyResetBtn: document.getElementById('empty-reset-btn'),
    retryBtn: document.getElementById('retry-btn')
  };

  // --- Utility Functions ---

  /**
   * Escape HTML to ensure security against any malicious strings.
   * @param {string} str
   * @returns {string}
   */
  function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Return corresponding CSS class for domain badges.
   * @param {string} domain
   * @returns {string}
   */
  function getDomainBadgeClass(domain) {
    switch (domain) {
      case 'Full Stack Development':
        return 'badge-fs';
      case 'UI/UX':
        return 'badge-ui';
      case 'Data Analytics':
        return 'badge-da';
      case 'Cyber Security':
        return 'badge-cs';
      default:
        return 'badge-default';
    }
  }

  /**
   * Return corresponding CSS class for mode badges.
   * @param {string} mode
   * @returns {string}
   */
  function getModeBadgeClass(mode) {
    const normalized = (mode || '').toLowerCase();
    if (normalized.includes('remote')) return 'badge-remote';
    if (normalized.includes('hybrid')) return 'badge-hybrid';
    if (normalized.includes('site') || normalized.includes('office')) return 'badge-onsite';
    return 'badge-default';
  }

  // --- Data Fetching ---

  /**
   * Fetch internship records from internship-records.json.
   */
  async function loadInternships() {
    state.isLoading = true;
    state.hasError = false;
    state.errorMessage = '';
    renderUI();

    try {
      const response = await fetch('internship-records.json', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText || 'Unable to fetch file'}`);
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.internships)) {
        throw new Error('Invalid JSON format: missing "internships" array.');
      }

      state.internships = data.internships;
      state.isLoading = false;
      state.hasError = false;
    } catch (err) {
      console.error('Error loading internship records:', err);
      state.isLoading = false;
      state.hasError = true;
      let userMsg = err.message || 'Unable to load internship records.';
      if (window.location.protocol === 'file:') {
        userMsg = 'Browsers restrict loading local JSON files via the file:// protocol. Please open this project using a local HTTP server (such as Python "python -m http.server 8000" or VS Code Live Server).';
      }
      state.errorMessage = userMsg;
    }

    renderUI();
  }

  // --- Filtering Logic ---

  /**
   * Filter internships matching current search term and domain.
   * @returns {Array} Filtered internship items
   */
  function getFilteredInternships() {
    const { searchTerm, domain } = state.filters;
    const query = searchTerm.trim().toLowerCase();

    return state.internships.filter((item) => {
      // 1. Domain Match
      const matchesDomain = (domain === 'all' || item.domain === domain);

      // 2. Search Text Match (Title, Domain, Location, Mode, Skills)
      let matchesSearch = true;
      if (query) {
        const titleMatch = item.title && item.title.toLowerCase().includes(query);
        const domainMatch = item.domain && item.domain.toLowerCase().includes(query);
        const locationMatch = item.location && item.location.toLowerCase().includes(query);
        const modeMatch = item.mode && item.mode.toLowerCase().includes(query);
        const skillsMatch = Array.isArray(item.skills) && item.skills.some(
          (skill) => skill.toLowerCase().includes(query)
        );

        matchesSearch = Boolean(titleMatch || domainMatch || locationMatch || modeMatch || skillsMatch);
      }

      return matchesDomain && matchesSearch;
    });
  }

  // --- Card Template Renderer ---

  /**
   * Create HTML markup for an internship card.
   * @param {Object} item Internship record object
   * @returns {string} HTML string
   */
  function createCardHTML(item) {
    const domainClass = getDomainBadgeClass(item.domain);
    const modeClass = getModeBadgeClass(item.mode);
    const openingsText = item.openings === 1 ? '1 Opening' : `${item.openings} Openings`;

    const skillsList = Array.isArray(item.skills)
      ? item.skills.map(skill => `<li class="skill-tag">${escapeHTML(skill)}</li>`).join('')
      : '';

    return `
      <article class="internship-card" data-id="${escapeHTML(item.id)}" tabindex="0" aria-labelledby="card-title-${escapeHTML(item.id)}">
        <header class="card-header">
          <div class="card-badges">
            <span class="badge ${domainClass}">${escapeHTML(item.domain)}</span>
            <span class="badge ${modeClass}">${escapeHTML(item.mode)}</span>
          </div>
          <span class="card-id" aria-label="Reference ID ${escapeHTML(item.id)}">${escapeHTML(item.id)}</span>
        </header>

        <h3 id="card-title-${escapeHTML(item.id)}" class="card-title">${escapeHTML(item.title)}</h3>

        <ul class="card-meta-list" aria-label="Internship details">
          <li class="card-meta-item">
            <svg class="meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span class="meta-label">Location:</span>
            <span class="meta-value">${escapeHTML(item.location)}</span>
          </li>
          <li class="card-meta-item">
            <svg class="meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span class="meta-label">Openings:</span>
            <span class="meta-value openings-highlight">${escapeHTML(openingsText)}</span>
          </li>
        </ul>

        <div class="card-skills-section">
          <p class="skills-heading">Required Skills</p>
          <ul class="skills-list" aria-label="Required skills for ${escapeHTML(item.title)}">
            ${skillsList}
          </ul>
        </div>
      </article>
    `;
  }

  // --- UI Update & Rendering ---

  /**
   * Render the entire UI based on current state.
   */
  function renderUI() {
    // 1. Handle Loading State
    if (state.isLoading) {
      elements.loadingState.classList.remove('hidden');
      elements.errorState.classList.add('hidden');
      elements.emptyState.classList.add('hidden');
      elements.grid.innerHTML = '';
      elements.resultsCount.textContent = 'Loading internships...';
      elements.activeFilterTags.innerHTML = '';
      return;
    }

    elements.loadingState.classList.add('hidden');

    // 2. Handle Error State
    if (state.hasError) {
      elements.errorState.classList.remove('hidden');
      elements.emptyState.classList.add('hidden');
      elements.grid.innerHTML = '';
      elements.resultsCount.textContent = 'Failed to load internships.';
      if (elements.errorMessage) {
        elements.errorMessage.textContent = state.errorMessage || 'Please ensure internship-records.json is accessible and try again.';
      }
      elements.activeFilterTags.innerHTML = '';
      return;
    }

    elements.errorState.classList.add('hidden');

    // 3. Filter Internships
    const filtered = getFilteredInternships();
    const totalCount = state.internships.length;
    const matchCount = filtered.length;

    // 4. Update Results Header Text & Active Filter Tags
    updateResultsSummary(matchCount, totalCount);

    // 5. Handle Empty State vs Active Listings
    if (matchCount === 0) {
      elements.grid.innerHTML = '';
      elements.emptyState.classList.remove('hidden');
    } else {
      elements.emptyState.classList.add('hidden');
      elements.grid.innerHTML = filtered.map(item => createCardHTML(item)).join('');
    }
  }

  /**
   * Update the live results summary text and active filter chips.
   * @param {number} matchCount
   * @param {number} totalCount
   */
  function updateResultsSummary(matchCount, totalCount) {
    const { searchTerm, domain } = state.filters;
    const hasActiveFilters = Boolean(searchTerm.trim() || domain !== 'all');

    if (matchCount === 0) {
      elements.resultsCount.innerHTML = `No internships match the selected criteria (<strong>0</strong> of <strong>${totalCount}</strong> shown).`;
    } else if (hasActiveFilters) {
      elements.resultsCount.innerHTML = `Showing <strong>${matchCount}</strong> of <strong>${totalCount}</strong> internships`;
    } else {
      elements.resultsCount.innerHTML = `Showing all <strong>${totalCount}</strong> internships`;
    }

    // Build active filter chips for quick visual feedback
    const chips = [];
    if (domain !== 'all') {
      chips.push(`<span class="filter-chip">Domain: <strong>${escapeHTML(domain)}</strong></span>`);
    }
    if (searchTerm.trim()) {
      chips.push(`<span class="filter-chip">Search: <strong>"${escapeHTML(searchTerm.trim())}"</strong></span>`);
    }

    elements.activeFilterTags.innerHTML = chips.join('');
  }

  // --- Event Handlers & Control Binding ---

  /**
   * Handle search input changes.
   */
  function handleSearchInput(e) {
    const value = e.target.value;
    state.filters.searchTerm = value;

    // Toggle clear search button visibility
    if (value.length > 0) {
      elements.searchClearBtn.classList.remove('hidden');
    } else {
      elements.searchClearBtn.classList.add('hidden');
    }

    renderUI();
  }

  /**
   * Handle search clear button click.
   */
  function handleSearchClear() {
    elements.searchInput.value = '';
    state.filters.searchTerm = '';
    elements.searchClearBtn.classList.add('hidden');
    elements.searchInput.focus();
    renderUI();
  }

  /**
   * Handle domain select change.
   */
  function handleDomainChange(e) {
    state.filters.domain = e.target.value;
    renderUI();
  }

  /**
   * Reset all filters to default state.
   */
  function handleResetFilters() {
    state.filters.searchTerm = '';
    state.filters.domain = 'all';

    elements.searchInput.value = '';
    elements.domainSelect.value = 'all';
    elements.searchClearBtn.classList.add('hidden');

    renderUI();
    elements.searchInput.focus();
  }

  /**
   * Attach all DOM event listeners.
   */
  function bindEvents() {
    // Search input
    elements.searchInput.addEventListener('input', handleSearchInput);
    elements.searchClearBtn.addEventListener('click', handleSearchClear);
    elements.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && elements.searchInput.value) {
        handleSearchClear();
      }
    });

    // Domain filter
    elements.domainSelect.addEventListener('change', handleDomainChange);

    // Reset buttons
    elements.resetFiltersBtn.addEventListener('click', handleResetFilters);
    elements.emptyResetBtn.addEventListener('click', handleResetFilters);

    // Error retry button
    elements.retryBtn.addEventListener('click', () => {
      loadInternships();
    });

    // Form submit prevention (enter key in search)
    elements.filterForm.addEventListener('submit', (e) => {
      e.preventDefault();
    });
  }

  // --- Initialization ---
  function init() {
    bindEvents();
    loadInternships();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

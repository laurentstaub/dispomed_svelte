<script>
  import { filterStore, updateFilter, resetFilters } from '$lib/stores/incidents.js';
  
  export let atcClasses = [];
  
  let searchInput = '';
  let showSearchDropdown = false;
  let searchSuggestions = [];
  
  // Update search with debouncing and fetch suggestions
  let searchTimeout;
  async function handleSearchInput(event) {
    const value = event.target.value;
    searchInput = value;
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      updateFilter('searchTerm', value);
      
      if (value.length >= 2) {
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(value)}&months=${$filterStore.monthsToShow}`);
          if (response.ok) {
            searchSuggestions = await response.json();
            showSearchDropdown = searchSuggestions.length > 0;
          }
        } catch (error) {
          console.error('Error fetching search suggestions:', error);
          searchSuggestions = [];
          showSearchDropdown = false;
        }
      } else {
        searchSuggestions = [];
        showSearchDropdown = false;
      }
    }, 300);
  }
  
  function handleTimeRangeChange(months) {
    updateFilter('monthsToShow', months);
  }
  
  function handleATCChange(event) {
    updateFilter('atcClass', event.target.value);
  }
  
  function handleVaccineToggle(event) {
    updateFilter('vaccinesOnly', event.target.checked);
  }
  
  function handleReset() {
    searchInput = '';
    resetFilters();
  }
</script>

<div class="filter-panel">
  <div class="filter-row">
    <!-- Search box -->
    <div class="filter-group search-group">
      <label for="search">Rechercher</label>
      <div class="search-container">
        <input
          id="search"
          type="text"
          bind:value={searchInput}
          on:input={handleSearchInput}
          on:focus={() => searchInput.length >= 2 && (showSearchDropdown = true)}
          on:blur={() => setTimeout(() => showSearchDropdown = false, 200)}
          placeholder="Nom du produit ou molécule..."
          class="search-input"
        />
        {#if showSearchDropdown && searchSuggestions.length > 0}
          <div class="search-dropdown">
            {#each searchSuggestions as suggestion}
              <button
                class="suggestion-item"
                on:click={() => {
                  searchInput = suggestion.product;
                  updateFilter('searchTerm', suggestion.product);
                  showSearchDropdown = false;
                }}
              >
                <div class="suggestion-content">
                  <strong>{suggestion.product}</strong>
                  <div class="suggestion-meta">
                    <span class="status status-{suggestion.current_status.toLowerCase()}">
                      {suggestion.current_status}
                    </span>
                    {#if !suggestion.in_current_filter}
                      <span class="out-of-filter">Hors période</span>
                    {/if}
                  </div>
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>
    
    <!-- ATC Class filter -->
    <div class="filter-group">
      <label for="atc-class">Classe ATC</label>
      <select
        id="atc-class"
        on:change={handleATCChange}
        disabled={$filterStore.searchTerm.length > 0}
      >
        <option value="">Toutes les classes</option>
        {#each atcClasses as atc}
          <option value={atc.code}>{atc.code} - {atc.name}</option>
        {/each}
      </select>
    </div>
    
    <!-- Vaccine filter -->
    <div class="filter-group checkbox-group">
      <label>
        <input
          type="checkbox"
          on:change={handleVaccineToggle}
          checked={$filterStore.vaccinesOnly}
        />
        Vaccins uniquement
      </label>
    </div>
  </div>
  
  <div class="filter-row">
    <!-- Time range filter -->
    <div class="filter-group time-range">
      <fieldset>
        <legend>Période</legend>
      <div class="radio-group">
        <label>
          <input
            type="radio"
            name="timeRange"
            value="12"
            checked={$filterStore.monthsToShow === 12}
            on:change={() => handleTimeRangeChange(12)}
          />
          12 mois
        </label>
        <label>
          <input
            type="radio"
            name="timeRange"
            value="24"
            checked={$filterStore.monthsToShow === 24}
            on:change={() => handleTimeRangeChange(24)}
          />
          24 mois
        </label>
        <label>
          <input
            type="radio"
            name="timeRange"
            value="all"
            checked={$filterStore.monthsToShow > 24}
            on:change={() => handleTimeRangeChange(48)}
          />
          Tout
        </label>
      </div>
      </fieldset>
    </div>
    
    <!-- Reset button -->
    <div class="filter-group">
      <button class="reset-button" on:click={handleReset}>
        Réinitialiser les filtres
      </button>
    </div>
  </div>
</div>

<style>
  .filter-panel {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .filter-row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    align-items: flex-end;
  }
  
  .filter-row:last-child {
    margin-bottom: 0;
  }
  
  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
    min-width: 200px;
  }
  
  .search-group {
    flex: 2;
    max-width: 400px;
  }
  
  .checkbox-group {
    flex: 0;
    min-width: auto;
  }
  
  .time-range {
    flex: 2;
  }
  
  fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }
  
  legend {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--grisfonce);
    padding: 0;
    margin-bottom: 0.5rem;
  }
  
  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--grisfonce);
  }
  
  input[type="text"],
  select {
    padding: 0.5rem;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    font-size: 1rem;
    background: white;
  }
  
  select {
    min-width: 300px;
    width: 100%;
  }
  
  input[type="text"]:focus,
  select:focus {
    outline: none;
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
  }
  
  select:disabled {
    background: #e9ecef;
    cursor: not-allowed;
  }
  
  .search-container {
    position: relative;
  }
  
  .search-input {
    width: 100%;
  }
  
  .search-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 1px solid #dee2e6;
    border-top: none;
    border-radius: 0 0 4px 4px;
    max-height: 300px;
    overflow-y: auto;
    z-index: 10;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .suggestion-item {
    display: block;
    width: 100%;
    padding: 0.5rem;
    text-align: left;
    border: none;
    background: none;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .suggestion-item:hover {
    background: #f8f9fa;
  }
  
  .suggestion-content {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    align-items: flex-start;
  }
  
  .suggestion-meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }
  
  .status {
    display: inline-block;
    padding: 0.125rem 0.375rem;
    border-radius: 3px;
    font-size: 0.625rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .status-rupture {
    background-color: var(--rouge);
    color: white;
  }
  
  .status-tension {
    background-color: var(--jaune);
    color: white;
  }
  
  .status-arret {
    background-color: var(--arret-bg);
    color: white;
  }
  
  .status-disponible {
    background-color: #28a745;
    color: white;
  }
  
  .out-of-filter {
    font-size: 0.625rem;
    color: var(--gris);
    font-style: italic;
  }
  
  .radio-group {
    display: flex;
    gap: 1.5rem;
  }
  
  .radio-group label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  input[type="radio"],
  input[type="checkbox"] {
    cursor: pointer;
  }
  
  .reset-button {
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    color: var(--grisfonce);
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }
  
  .reset-button:hover {
    background: #f8f9fa;
    border-color: #adb5bd;
  }
  
  @media (max-width: 768px) {
    .filter-group {
      min-width: 100%;
    }
  }
</style>
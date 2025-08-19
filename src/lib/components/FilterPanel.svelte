<script>
  import { filterStore, updateFilter, resetFilters } from '$lib/stores/incidents.js';
  
  let { atcClasses = [] } = $props();
  
  // Debug atcClasses - using $effect instead of $:
  $effect(() => {
    console.log('FilterPanel atcClasses:', atcClasses);
  });
  
  let searchInput = $state('');
  let showSearchDropdown = $state(false);
  let searchSuggestions = $state([]);
  let molecules = $state([]); // TODO: Load from API
  
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
  
  function handleMoleculeChange(event) {
    updateFilter('molecule', event.target.value);
  }
  
  function handleVaccineToggle(event) {
    updateFilter('vaccinesOnly', event.target.checked);
  }
  
  function handleReset() {
    searchInput = '';
    resetFilters();
  }
</script>

<div id="mainfilter-container">
  <h2 class="card-title">Filtres</h2>
  
  <div class="filter-group">
    <input
      id="mainfilter-search-box"
      type="text"
      bind:value={searchInput}
      on:input={handleSearchInput}
      on:focus={() => searchInput.length >= 2 && (showSearchDropdown = true)}
      on:blur={() => setTimeout(() => showSearchDropdown = false, 200)}
      placeholder="Recherche produit, molécule..."
    />
    {#if showSearchDropdown && searchSuggestions.length > 0}
      <div class="search-dropdown">
        {#each searchSuggestions as suggestion}
          <button
            class="search-suggestion"
            on:click={() => {
              searchInput = suggestion.product;
              updateFilter('searchTerm', suggestion.product);
              showSearchDropdown = false;
            }}
          >
            <div class="search-suggestion-content">
              <span class="search-suggestion-name">{suggestion.product}</span>
              <span class="search-status-badge status-{suggestion.current_status.toLowerCase()}">
                {suggestion.current_status}
              </span>
              {#if !suggestion.in_current_filter}
                <span class="search-filter-badge">Hors période</span>
              {/if}
            </div>
          </button>
        {/each}
      </div>
    {/if}
  </div>
  
  <div class="filter-group">
    <select
      class="mainfilter-selector"
      id="atc"
      name="atc"
      on:change={handleATCChange}
    >
      <option value="">Choisir une classe ATC</option>
      {#each atcClasses as atcClass}
        <option value={atcClass.code}>{atcClass.code} - {atcClass.name}</option>
      {/each}
    </select>
  </div>
  
  <div class="filter-group">
    <select
      class="mainfilter-selector"
      id="molecule"
      name="molecule"
      on:change={handleMoleculeChange}
    >
      <option value="">Choisir une molécule</option>
      {#each molecules as molecule}
        <option value={molecule.code}>{molecule.name}</option>
      {/each}
    </select>
  </div>
  
  <div class="filter-group">
    <input type="checkbox" id="vaccines-filter" on:change={handleVaccineToggle} checked={$filterStore.vaccinesOnly} />
    <label for="vaccines-filter" class="card-subtitle">Vaccins uniquement (ATC J07)</label>
  </div>
  
  <div class="filter-group">
    <div class="mainfilter-button-row" role="radiogroup" aria-label="Select time period">
      <input 
        type="radio" 
        id="period-12" 
        name="period" 
        value="12" 
        class="mainfilter-radio" 
        checked={$filterStore.monthsToShow === 12}
        on:change={() => handleTimeRangeChange(12)}
      />
      <label for="period-12" class="mainfilter-button">12 mois</label>
      
      <input 
        type="radio" 
        id="period-24" 
        name="period" 
        value="24" 
        class="mainfilter-radio"
        checked={$filterStore.monthsToShow === 24}
        on:change={() => handleTimeRangeChange(24)}
      />
      <label for="period-24" class="mainfilter-button">24 mois</label>
      
      <input 
        type="radio" 
        id="period-all" 
        name="period" 
        value="all" 
        class="mainfilter-radio"
        checked={$filterStore.monthsToShow > 24}
        on:change={() => handleTimeRangeChange(48)}
      />
      <label for="period-all" class="mainfilter-button">Tout</label>
    </div>
  </div>
  
  <button id="mainfilter-reset" on:click={handleReset}>Réinitialiser</button>
  
  <div class="filter-group">
    <div id="legend-container">
      <div id="floating-legend">
        <p id="title-legend">Légende</p>
        <div class="legend-item">
          <span class="legend-color-box legend-rupture"></span>
          Rupture
        </div>
        <div class="legend-item">
          <span class="legend-color-box legend-tension"></span>
          Tension
        </div>
        <div class="legend-item">
          <span class="legend-color-box legend-arret"></span>
          Arrêt de commercialisation
        </div>
        <div class="legend-item">
          <span class="legend-color-box legend-disponible"></span>
          Disponible
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  /* Override only necessary styles - let common.css handle the rest */
  #mainfilter-search-box {
    position: relative;
  }
</style>
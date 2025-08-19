<script>
  import { onMount } from 'svelte';
  import FilterPanel from '$lib/components/FilterPanel.svelte';
  import SummaryChart from '$lib/components/SummaryChart.svelte';
  import IncidentTable from '$lib/components/IncidentTable.svelte';
  import { incidentStore, filterStore } from '$lib/stores/incidents.js';
  
  export let data;
  
  // Initialize stores with server data
  $: if (data.incidents) {
    incidentStore.set(data.incidents);
  }
  
  let isLoading = false;
  let error = null;
  
  // Reactive filtered data based on filters
  $: filteredIncidents = filterIncidents($incidentStore, $filterStore);
  
  function filterIncidents(incidents, filters) {
    if (!incidents) return [];
    
    let filtered = [...incidents];
    
    // Apply search filter
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(incident => 
        incident.product.toLowerCase().includes(term) ||
        incident.molecule?.toLowerCase().includes(term)
      );
    }
    
    // Apply ATC class filter
    if (filters.atcClass) {
      filtered = filtered.filter(incident => 
        incident.atc_code?.startsWith(filters.atcClass)
      );
    }
    
    // Apply vaccine filter
    if (filters.vaccinesOnly) {
      filtered = filtered.filter(incident => 
        incident.atc_code?.startsWith('J07')
      );
    }
    
    return filtered;
  }
</script>

<div class="container">
  <div class="page-header">
    <h2>Suivi des ruptures et tensions d'approvisionnement</h2>
    <p class="update-date">Mise à jour : {new Date(data.dateReport).toLocaleDateString('fr-FR')}</p>
  </div>
  
  <FilterPanel atcClasses={data.atcClasses} />
  
  {#if data.error}
    <div class="error-message">
      <h2>Erreur de base de données</h2>
      <p>{data.message || data.error}</p>
      <p class="error-help">Assurez-vous que la base de données est configurée correctement.</p>
    </div>
  {:else if error}
    <div class="error-message">
      <h2>Erreur</h2>
      <p>{error}</p>
      <button on:click={() => window.location.reload()}>Actualiser la page</button>
    </div>
  {:else if isLoading}
    <div class="loading">
      <div class="loading-spinner"></div>
      <p>Chargement des données...</p>
    </div>
  {:else if filteredIncidents.length > 0}
    <SummaryChart incidents={filteredIncidents} />
    <IncidentTable incidents={filteredIncidents} />
  {:else if $filterStore.searchTerm || $filterStore.atcClass || $filterStore.vaccinesOnly}
    <div class="no-results">
      <h3>Aucun résultat trouvé</h3>
      <p>Aucun incident ne correspond aux filtres sélectionnés.</p>
      <button class="reset-filters-btn" on:click={() => import('$lib/stores/incidents.js').then(m => m.resetFilters())}>
        Réinitialiser les filtres
      </button>
    </div>
  {:else}
    <div class="no-data">
      <h3>Aucune donnée disponible</h3>
      <p>Aucun incident n'est enregistré pour la période sélectionnée.</p>
    </div>
  {/if}
</div>

<style>
  .page-header {
    margin-bottom: 2rem;
  }
  
  .page-header h2 {
    font-size: 1.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  .update-date {
    color: var(--gris);
    font-size: 0.875rem;
  }
  
  .loading {
    text-align: center;
    padding: 3rem;
    color: var(--gris);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .error-message {
    text-align: center;
    padding: 3rem;
    background: #fff5f5;
    border: 1px solid #fed7d7;
    border-radius: 8px;
    color: #c53030;
    margin: 2rem 0;
  }
  
  .error-message h2 {
    margin-bottom: 1rem;
    color: #c53030;
  }
  
  .error-message button {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #c53030;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .error-message button:hover {
    background: #b91c1c;
  }
  
  .error-help {
    font-size: 0.875rem;
    margin-top: 0.5rem;
    color: #9f1239;
  }
  
  .no-results,
  .no-data {
    text-align: center;
    padding: 3rem;
    background: #f8f9fa;
    border-radius: 8px;
    color: var(--gris);
  }
  
  .no-results h3,
  .no-data h3 {
    margin-bottom: 1rem;
    color: var(--grisfonce);
  }
  
  .reset-filters-btn {
    margin-top: 1rem;
    padding: 0.5rem 1rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .reset-filters-btn:hover {
    background: #0052a3;
  }
</style>
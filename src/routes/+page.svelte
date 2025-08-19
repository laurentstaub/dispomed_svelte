<script>
  import { onMount } from 'svelte';
  import FilterPanel from '$lib/components/FilterPanel.svelte';
  import SummaryChart from '$lib/components/SummaryChart.svelte';
  import IncidentTable from '$lib/components/IncidentTable.svelte';
  import { incidentStore, filterStore } from '$lib/stores/incidents.js';
  
  let { data } = $props();
  
  // Initialize stores with server data
  $effect(() => {
    if (data.incidents) {
      incidentStore.set(data.incidents);
    }
  });
  
  let isLoading = $state(false);
  let error = $state(null);
  
  // Reactive filtered data based on filters
  let filteredIncidents = $derived(filterIncidents($incidentStore, $filterStore));
  
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

<div class="main-container">
  <div id="title-container">
    <div class="header-title">
      <h1>
        <div class="pill-icon">💊</div>
        <span id="report-title">INCIDENTS DE DISPONIBILITÉ des médicaments et vaccins</span>
      </h1>
      <p id="mise-a-jour">Mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
    </div>
  </div>
  
  {#if data.error}
    <div class="error-message card">
      <h2>Erreur de base de données</h2>
      <p>{data.message || data.error}</p>
      <p class="error-help">Assurez-vous que la base de données est configurée correctement.</p>
    </div>
  {:else if error}
    <div class="error-message card">
      <h2>Erreur</h2>
      <p>{error}</p>
      <button on:click={() => window.location.reload()}>Actualiser la page</button>
    </div>
  {:else if isLoading}
    <div class="loading card">
      <div class="loading-spinner"></div>
      <p>Chargement des données...</p>
    </div>
  {:else}
    <div class="flex-container">
      <FilterPanel atcClasses={data.atcClasses} />
      <div id="summary">
        {#if filteredIncidents.length > 0}
          <SummaryChart incidents={filteredIncidents} />
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
    </div>
    
    {#if filteredIncidents.length > 0}
      <div id="maintbl-dash">
        <IncidentTable incidents={filteredIncidents} />
      </div>
    {/if}
  {/if}
</div>

<div id="source-info">
  <div id="info-container">
    <h2>Avertissement</h2>
    <p>Les données présentées sur ce site proviennent de sources gouvernementales publiques. Bien que nous nous efforcions de garantir l'exactitude et la fiabilité des informations affichées, ce site ne saurait être tenu responsable des erreurs, omissions ou interprétations des données. Ce site est une représentation visuelle des données et ne constitue pas une source officielle ou faisant autorité. Pour des informations certifiées, veuillez consulter directement les sources gouvernementales référencées sur <a href='https://ansm.sante.fr/disponibilites-des-produits-de-sante/medicaments'>Disponibilité des produits de santé</a>.</p>
    <p>En utilisant ce site, vous acceptez ces conditions.</p>
  </div>
</div>

<style>
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
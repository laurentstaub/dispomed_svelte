<script>
  import { onMount } from 'svelte';
  
  export let cisCodes = [];
  
  let emaIncidents = [];
  let isLoading = true;
  let error = null;
  
  onMount(async () => {
    if (!cisCodes || cisCodes.length === 0) {
      isLoading = false;
      return;
    }
    
    try {
      const response = await fetch(`/api/ema-incidents?cis_codes=${cisCodes.join(',')}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch EMA incidents');
      }
      
      emaIncidents = await response.json();
    } catch (err) {
      console.error('Error fetching EMA incidents:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <div class="ema-incidents loading">
    <h3>Incidents EMA</h3>
    <p>Chargement des données EMA...</p>
  </div>
{:else if error}
  <div class="ema-incidents error">
    <h3>Incidents EMA</h3>
    <p>Erreur: {error}</p>
  </div>
{:else if emaIncidents && emaIncidents.length > 0}
  <div class="ema-incidents">
    <h3>Incidents EMA ({emaIncidents.length})</h3>
    <div class="incidents-list">
      {#each emaIncidents as incident}
        <div class="incident-card">
          <h4>{incident.brand_name || incident.active_substance}</h4>
          <div class="incident-details">
            <p><strong>Substance active:</strong> {incident.active_substance}</p>
            <p><strong>Début:</strong> {incident.shortage_start ? new Date(incident.shortage_start).toLocaleDateString('fr-FR') : 'N/A'}</p>
            <p><strong>Fin:</strong> {incident.shortage_end ? new Date(incident.shortage_end).toLocaleDateString('fr-FR') : 'En cours'}</p>
            <p><strong>Statut:</strong> {incident.shortage_status}</p>
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .ema-incidents {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .ema-incidents.loading,
  .ema-incidents.error {
    background: #f8f9fa;
    color: var(--gris);
  }
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--grisfonce);
  }
  
  .incidents-list {
    display: grid;
    gap: 1rem;
  }
  
  .incident-card {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 4px;
    padding: 1rem;
  }
  
  .incident-card h4 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--grisfonce);
  }
  
  .incident-details p {
    margin: 0.25rem 0;
    font-size: 0.875rem;
  }
</style>
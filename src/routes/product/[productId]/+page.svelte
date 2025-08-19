<script>
  import { onMount } from 'svelte';
  import ProductChart from '$lib/components/ProductChart.svelte';
  import EMAIncidents from '$lib/components/EMAIncidents.svelte';
  import SubstitutionsList from '$lib/components/SubstitutionsList.svelte';
  
  export let data;
  
  let product = null;
  let incidents = [];
  let isLoading = true;
  let error = null;
  
  onMount(async () => {
    if (data.error) {
      error = data.message || data.error;
      isLoading = false;
      return;
    }
    
    try {
      // Fetch product incidents
      const response = await fetch(`/api/incidents/product/${data.productId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch product data');
      }
      
      incidents = await response.json();
      
      if (incidents.length > 0) {
        // Use first incident to get product info
        product = {
          id: incidents[0].product_id,
          name: incidents[0].product,
          accented_name: incidents[0].accented_product,
          cis_codes: incidents[0].cis_codes,
          atc_code: incidents[0].atc_code,
          classe_atc: incidents[0].classe_atc
        };
      }
    } catch (err) {
      console.error('Error fetching product data:', err);
      error = 'Erreur lors du chargement des données produit';
    } finally {
      isLoading = false;
    }
  });
</script>

<div class="container">
  {#if error}
    <div class="error-message">
      <h2>Erreur</h2>
      <p>{error}</p>
      <a href="/">← Retour à l'accueil</a>
    </div>
  {:else if isLoading}
    <div class="loading">
      <p>Chargement des données produit...</p>
    </div>
  {:else if product}
    <div class="product-header">
      <h1>{product.accented_name || product.name}</h1>
      <div class="product-meta">
        <span class="atc-class">{product.classe_atc}</span>
        <span class="cis-count">{product.cis_codes?.length || 0} spécialité(s)</span>
      </div>
      <a href="/" class="back-link">← Retour à la liste</a>
    </div>
    
    <!-- Product incident timeline -->
    <ProductChart {incidents} globalReportDate={data.globalReportDate} />
    
    <!-- EMA Incidents if available -->
    {#if product.cis_codes && product.cis_codes.length > 0}
      <EMAIncidents cisCodes={product.cis_codes} />
    {/if}
    
    <!-- Substitutions if available -->
    {#if product.cis_codes && product.cis_codes.length > 0}
      <SubstitutionsList cisCodes={product.cis_codes} />
    {/if}
    
    <!-- Incident details table -->
    <div class="incident-details">
      <h3>Historique des incidents</h3>
      {#if incidents.length > 0}
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Statut</th>
                <th>Date début</th>
                <th>Date fin</th>
                <th>Durée</th>
                <th>Mise à jour</th>
              </tr>
            </thead>
            <tbody>
              {#each incidents as incident}
                <tr>
                  <td>
                    <span class="status-badge status-{incident.status.toLowerCase()}">
                      {incident.status}
                    </span>
                  </td>
                  <td>{new Date(incident.start_date).toLocaleDateString('fr-FR')}</td>
                  <td>{incident.end_date ? new Date(incident.end_date).toLocaleDateString('fr-FR') : 'En cours'}</td>
                  <td>
                    {#if incident.end_date}
                      {Math.floor((new Date(incident.end_date) - new Date(incident.start_date)) / (1000 * 60 * 60 * 24))} jours
                    {:else}
                      {Math.floor((new Date() - new Date(incident.start_date)) / (1000 * 60 * 60 * 24))} jours
                    {/if}
                  </td>
                  <td>{new Date(incident.mise_a_jour).toLocaleDateString('fr-FR')}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {:else}
        <p class="no-data">Aucun incident enregistré pour ce produit.</p>
      {/if}
    </div>
  {:else}
    <div class="no-data">
      <h2>Produit non trouvé</h2>
      <p>Le produit demandé n'existe pas ou n'a pas d'incidents enregistrés.</p>
      <a href="/">← Retour à l'accueil</a>
    </div>
  {/if}
</div>

<style>
  .product-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #dee2e6;
  }
  
  .product-header h1 {
    font-size: 1.875rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--grisfonce);
  }
  
  .product-meta {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .atc-class {
    background: #e3f2fd;
    color: #1565c0;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .cis-count {
    color: var(--gris);
    font-size: 0.875rem;
  }
  
  .back-link {
    color: #0066cc;
    text-decoration: none;
    font-size: 0.875rem;
  }
  
  .back-link:hover {
    text-decoration: underline;
  }
  
  .loading,
  .error-message,
  .no-data {
    text-align: center;
    padding: 3rem;
    background: #f8f9fa;
    border-radius: 8px;
    margin: 2rem 0;
  }
  
  .error-message {
    background: #fff5f5;
    border: 1px solid #fed7d7;
    color: #c53030;
  }
  
  .incident-details {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    margin-top: 2rem;
  }
  
  .incident-details h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--grisfonce);
  }
  
  .table-wrapper {
    overflow-x: auto;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th,
  td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #e9ecef;
  }
  
  th {
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--grisfonce);
    background: #f8f9fa;
  }
  
  .status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }
  
  .status-rupture {
    background-color: var(--rouge);
  }
  
  .status-tension {
    background-color: var(--jaune);
  }
  
  .status-arret {
    background-color: var(--arret-bg);
  }
</style>
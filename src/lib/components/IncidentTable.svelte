<script>
  export let incidents = [];
  
  function getStatusColor(status) {
    switch(status) {
      case 'Rupture': return 'var(--rouge)';
      case 'Tension': return 'var(--jaune)';
      case 'Arret': return 'var(--arret-bg)';
      default: return 'var(--gris)';
    }
  }
  
  function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  }
  
  function getDuration(startDate, endDate) {
    if (!startDate) return '-';
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    const days = Math.floor((end - start) / (1000 * 60 * 60 * 24));
    
    if (days < 30) return `${days} jours`;
    if (days < 365) return `${Math.floor(days / 30)} mois`;
    return `${Math.floor(days / 365)} ans`;
  }
</script>

<div class="incident-table">
  <h3>Détail des incidents ({incidents.length} résultats)</h3>
  
  {#if incidents.length > 0}
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Produit</th>
            <th>Molécule</th>
            <th>Statut</th>
            <th>Date début</th>
            <th>Durée</th>
            <th>Classe ATC</th>
            <th>Spécialités</th>
          </tr>
        </thead>
        <tbody>
          {#each incidents as incident}
            <tr>
              <td class="product-name">
                <a href="/product/{incident.product_id}">
                  {incident.product}
                </a>
              </td>
              <td>{incident.molecule || '-'}</td>
              <td>
                <span 
                  class="status-badge"
                  style="background-color: {getStatusColor(incident.status)};"
                >
                  {incident.status}
                </span>
              </td>
              <td>{formatDate(incident.start_date)}</td>
              <td>{getDuration(incident.start_date, incident.end_date)}</td>
              <td>{incident.classe_atc || '-'}</td>
              <td class="specialites">
                {incident.cis_codes?.length || 0}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="no-data">Aucun incident à afficher</p>
  {/if}
</div>

<style>
  .incident-table {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
  }
  
  h3 {
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
  
  th {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 2px solid #dee2e6;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--grisfonce);
    background: #f8f9fa;
  }
  
  td {
    padding: 0.75rem;
    border-bottom: 1px solid #e9ecef;
    font-size: 0.875rem;
  }
  
  tbody tr:hover {
    background: #f8f9fa;
  }
  
  .product-name a {
    color: #0066cc;
    text-decoration: none;
    font-weight: 500;
  }
  
  .product-name a:hover {
    text-decoration: underline;
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
  
  .specialites {
    text-align: center;
  }
  
  .no-data {
    text-align: center;
    padding: 2rem;
    color: var(--gris);
  }
  
  @media (max-width: 768px) {
    .table-wrapper {
      overflow-x: scroll;
    }
    
    table {
      min-width: 600px;
    }
  }
</style>
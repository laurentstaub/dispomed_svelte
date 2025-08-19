<script>
  import { onMount } from 'svelte';
  
  export let cisCodes = [];
  
  let substitutions = [];
  let isLoading = true;
  let error = null;
  
  onMount(async () => {
    if (!cisCodes || cisCodes.length === 0) {
      isLoading = false;
      return;
    }
    
    try {
      // Fetch substitutions for each CIS code
      const substitutionPromises = cisCodes.map(async (cisCode) => {
        const response = await fetch(`/api/substitutions/${cisCode}`);
        if (response.ok) {
          return await response.json();
        }
        return [];
      });
      
      const allSubstitutions = await Promise.all(substitutionPromises);
      substitutions = allSubstitutions.flat();
      
      // Remove duplicates based on CIS codes
      const seen = new Set();
      substitutions = substitutions.filter(sub => {
        const key = `${sub.code_cis_origine}-${sub.code_cis_cible}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
    } catch (err) {
      console.error('Error fetching substitutions:', err);
      error = err.message;
    } finally {
      isLoading = false;
    }
  });
</script>

{#if isLoading}
  <div class="substitutions loading">
    <h3>Substitutions thérapeutiques</h3>
    <p>Chargement des substitutions...</p>
  </div>
{:else if error}
  <div class="substitutions error">
    <h3>Substitutions thérapeutiques</h3>
    <p>Erreur: {error}</p>
  </div>
{:else if substitutions && substitutions.length > 0}
  <div class="substitutions">
    <h3>Substitutions thérapeutiques ({substitutions.length})</h3>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>Produit origine</th>
            <th>Produit cible</th>
            <th>Score similarité</th>
            <th>Type équivalence</th>
            <th>Raison</th>
          </tr>
        </thead>
        <tbody>
          {#each substitutions as sub}
            <tr>
              <td>
                <div class="product-info">
                  <strong>{sub.denomination_origine}</strong>
                  <small>CIS: {sub.code_cis_origine}</small>
                </div>
              </td>
              <td>
                <div class="product-info">
                  <strong>{sub.denomination_cible}</strong>
                  <small>CIS: {sub.code_cis_cible}</small>
                </div>
              </td>
              <td>
                <span class="score score-{Math.floor(sub.score_similarite / 20)}">
                  {sub.score_similarite}%
                </span>
              </td>
              <td>{sub.type_equivalence}</td>
              <td class="reason">{sub.raison}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
{/if}

<style>
  .substitutions {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  .substitutions.loading,
  .substitutions.error {
    background: #f8f9fa;
    color: var(--gris);
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
  
  .product-info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .product-info strong {
    font-size: 0.875rem;
  }
  
  .product-info small {
    font-size: 0.75rem;
    color: var(--gris);
  }
  
  .score {
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 600;
    font-size: 0.75rem;
    color: white;
  }
  
  .score-0, .score-1, .score-2 {
    background: #dc3545; /* Low score - red */
  }
  
  .score-3, .score-4 {
    background: #ffc107; /* Medium score - yellow */
    color: #212529;
  }
  
  .score-5 {
    background: #28a745; /* High score - green */
  }
  
  .reason {
    font-size: 0.875rem;
    max-width: 200px;
    word-wrap: break-word;
  }
  
  @media (max-width: 768px) {
    .table-wrapper {
      overflow-x: scroll;
    }
    
    table {
      min-width: 800px;
    }
  }
</style>
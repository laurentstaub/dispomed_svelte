<script>
  import SubstitutionsList from '$lib/components/SubstitutionsList.svelte';
  
  export let data;
</script>

<svelte:head>
  <title>Substitutions - {data.denomination} - Dispomed</title>
</svelte:head>

<div class="container">
  {#if data.error}
    <div class="error-message">
      <h2>Erreur</h2>
      <p>{data.message || data.error}</p>
      <a href="/">← Retour à l'accueil</a>
    </div>
  {:else}
    <div class="substitutions-header">
      <h1>Substitutions thérapeutiques</h1>
      <div class="product-info">
        <h2>{data.denomination}</h2>
        <p class="cis-code">Code CIS: {data.cis_code}</p>
      </div>
      <a href="/" class="back-link">← Retour à la liste</a>
    </div>
    
    <SubstitutionsList cisCodes={[data.cis_code]} />
  {/if}
</div>

<style>
  .substitutions-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #dee2e6;
  }
  
  .substitutions-header h1 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--grisfonce);
  }
  
  .product-info h2 {
    font-size: 1.25rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--grisfonce);
  }
  
  .cis-code {
    color: var(--gris);
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }
  
  .back-link {
    color: #0066cc;
    text-decoration: none;
    font-size: 0.875rem;
  }
  
  .back-link:hover {
    text-decoration: underline;
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
  
  .error-message a {
    color: #0066cc;
    text-decoration: none;
  }
  
  .error-message a:hover {
    text-decoration: underline;
  }
</style>
<script>
  import '../app.css';
</script>

<div class="app-layout">
  <header>
    <nav class="container">
      <h1>Dispomed - Tableau de bord des disponibilités</h1>
    </nav>
  </header>
  
  <main>
    <slot />
  </main>
  
  <footer>
    <div class="container">
      <p>© 2024 Dispomed - Données pharmaceutiques France</p>
    </div>
  </footer>
</div>

<style>
  .app-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  header {
    background: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
    padding: 1rem 0;
  }
  
  nav h1 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--grisfonce);
  }
  
  main {
    flex: 1;
    padding: 2rem 0;
  }
  
  footer {
    background: #f8f9fa;
    border-top: 1px solid #dee2e6;
    padding: 1rem 0;
    margin-top: auto;
  }
  
  footer p {
    text-align: center;
    color: var(--gris);
    font-size: 0.875rem;
  }
</style>
<script>
  import { onMount } from 'svelte';
  import { monthlyChartData } from '$lib/stores/incidents.js';
  import * as d3 from 'd3';
  
  export let incidents = [];
  
  // Use the incidents prop
  $: if (incidents && incidents.length > 0) {
    console.log(`SummaryChart received ${incidents.length} incidents`);
  }
  
  let chartContainer;
  let chart;
  
  // React to data changes
  $: if (chart && $monthlyChartData) {
    updateChart($monthlyChartData);
  }
  
  onMount(() => {
    if (chartContainer) {
      initChart();
    }
    
    return () => {
      // Cleanup
      if (chart) {
        d3.select(chartContainer).selectAll('*').remove();
      }
    };
  });
  
  function initChart() {
    // This is a placeholder - will integrate the full D3.js chart later
    const width = 600;
    const height = 300;
    
    chart = d3.select(chartContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);
    
    // Add a simple placeholder text
    chart.append('text')
      .attr('x', width / 2)
      .attr('y', height / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', '#666')
      .text('Graphique de synthèse (à implémenter)');
  }
  
  function updateChart(data) {
    // Will implement chart updates here
    console.log('Chart data updated:', data);
  }
</script>

<div class="summary-chart">
  <h3>Évolution des ruptures et tensions</h3>
  <div bind:this={chartContainer} class="chart-container"></div>
</div>

<style>
  .summary-chart {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
  
  h3 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--grisfonce);
  }
  
  .chart-container {
    width: 100%;
    min-height: 300px;
  }
  
  :global(.chart-container svg) {
    width: 100%;
    height: auto;
  }
</style>
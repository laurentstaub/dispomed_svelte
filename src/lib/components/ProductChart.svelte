<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let incidents = [];
  export let globalReportDate = null;
  
  // Use the globalReportDate prop
  $: if (globalReportDate) {
    console.log(`ProductChart report date: ${globalReportDate}`);
  }
  
  let chartContainer;
  let chart;
  
  onMount(() => {
    if (chartContainer && incidents.length > 0) {
      initChart();
    }
    
    return () => {
      if (chart) {
        d3.select(chartContainer).selectAll('*').remove();
      }
    };
  });
  
  $: if (chart && incidents) {
    updateChart();
  }
  
  function initChart() {
    // This is a placeholder - will implement full D3.js timeline chart later
    const width = 800;
    const height = 400;
    
    chart = d3.select(chartContainer)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`);
    
    updateChart();
  }
  
  function updateChart() {
    if (!chart || !incidents.length) return;
    
    chart.selectAll('*').remove();
    
    // Add a simple placeholder visualization
    chart.append('rect')
      .attr('x', 50)
      .attr('y', 50)
      .attr('width', 700)
      .attr('height', 300)
      .attr('fill', '#f8f9fa')
      .attr('stroke', '#dee2e6');
    
    chart.append('text')
      .attr('x', 400)
      .attr('y', 200)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('fill', '#666')
      .text(`Chronologie des incidents (${incidents.length} incidents)`);
    
    // Add simple timeline markers for each incident
    incidents.forEach((incident, i) => {
      const x = 100 + (i * 100);
      const y = 250;
      
      chart.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 6)
        .attr('fill', getStatusColor(incident.status));
      
      chart.append('text')
        .attr('x', x)
        .attr('y', y + 25)
        .attr('text-anchor', 'middle')
        .style('font-size', '12px')
        .style('fill', '#666')
        .text(incident.status);
    });
  }
  
  function getStatusColor(status) {
    switch(status) {
      case 'Rupture': return '#d62728';
      case 'Tension': return '#ff7f0e';
      case 'Arret': return '#969696';
      default: return '#7f7f7f';
    }
  }
</script>

<div class="product-chart">
  <h3>Chronologie des incidents</h3>
  <div bind:this={chartContainer} class="chart-container"></div>
</div>

<style>
  .product-chart {
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
    min-height: 400px;
  }
  
  :global(.chart-container svg) {
    width: 100%;
    height: auto;
  }
</style>
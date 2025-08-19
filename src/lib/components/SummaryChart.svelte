<script>
  import { onMount } from 'svelte';
  import * as d3 from 'd3';
  
  export let incidents = [];
  
  let chartContainer;
  let monthlyData = [];
  
  // French locale for D3
  const frFr = d3.timeFormatLocale({
    dateTime: "%A %e %B %Y à %X",
    date: "%d/%m/%Y",
    time: "%H:%M:%S",
    periods: ["", ""],
    days: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
    shortDays: ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."],
    months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    shortMonths: ["Janv.", "Fév.", "Mars", "Avr.", "Mai", "Juin", "Juil.", "Août", "Sept.", "Oct.", "Nov.", "Déc."],
  });

  const formatDate = frFr.format("%e %B %Y");
  const formatDateShort = frFr.format("%b");
  
  // Process incidents into monthly data
  function processMonthlyData(incidents) {
    if (!incidents || incidents.length === 0) return [];
    
    const monthlyMap = new Map();
    const now = new Date();
    
    // Initialize months
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}-01`;
      monthlyMap.set(key, {
        date: monthStart,
        rupture: 0,
        tension: 0
      });
    }
    
    // Count incidents by month
    incidents.forEach(incident => {
      // Parse dates - they come as strings from the database
      const startDate = incident.start_date ? new Date(incident.start_date) : null;
      const endDate = incident.calculated_end_date ? new Date(incident.calculated_end_date) : now;
      
      if (!startDate) return; // Skip if no start date
      
      // For each month, check if incident was active
      for (const [key, monthData] of monthlyMap) {
        const monthStart = new Date(monthData.date);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        
        // Check if incident overlaps with this month
        if (startDate <= monthEnd && endDate >= monthStart) {
          const cisCount = Array.isArray(incident.cis_codes) ? incident.cis_codes.length : 1;
          
          if (incident.status === 'Rupture') {
            monthData.rupture += cisCount;
          } else if (incident.status === 'Tension') {
            monthData.tension += cisCount;
          }
        }
      }
    });
    
    return Array.from(monthlyMap.values());
  }
  
  function getSpecialiteCount(incident) {
    return Array.isArray(incident.cis_codes) ? incident.cis_codes.length : 1;
  }
  
  function shouldShowMarkForMonth(date, monthsToShow = 12) {
    // For views of 24 months or more, only show quarterly (Jan, Apr, Jul, Oct)
    if (monthsToShow >= 24) {
      return date.getMonth() % 3 === 0;
    }
    return true;
  }
  
  function getWindowWidth() {
    return typeof window !== 'undefined' ? window.innerWidth : 900;
  }
  
  const labelFontSizeScale = d3.scaleLinear()
    .domain([400, 900])
    .range([18, 12])
    .clamp(true);
  
  // React to incidents changes
  $: if (incidents && incidents.length > 0) {
    monthlyData = processMonthlyData(incidents);
    if (chartContainer) {
      drawChart();
    }
  }
  
  onMount(() => {
    if (incidents && incidents.length > 0) {
      monthlyData = processMonthlyData(incidents);
      drawChart();
    }
    
    return () => {
      // Cleanup
      if (chartContainer) {
        d3.select(chartContainer).selectAll('*').remove();
      }
    };
  });
  
  function drawChart() {
    if (!chartContainer || !monthlyData.length) return;
    
    const margin = { top: 40, right: 15, bottom: 35, left: 10 };
    const height = 380;
    const width = 600;
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;
    const windowWidth = getWindowWidth();
    
    // Clear existing chart
    d3.select(chartContainer).selectAll('*').remove();
    
    // Filter out months with no data for line drawing
    const filteredData = monthlyData.filter(d => d.rupture > 0 || d.tension > 0);
    
    if (filteredData.length === 0) {
      // Show "no data" message
      const svg = d3.select(chartContainer)
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
        
      svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('fill', '#666')
        .text('Aucune donnée disponible pour la période sélectionnée');
      return;
    }
    
    // Create scales
    const startDate = monthlyData[0].date;
    const endDate = monthlyData[monthlyData.length - 1].date;
    
    const xScale = d3.scaleTime()
      .domain([startDate, endDate])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(filteredData, d => Math.max(d.rupture, d.tension))])
      .nice()
      .range([innerHeight, 0]);

    const xAxis = d3.axisBottom(xScale)
      .ticks(d3.timeMonth.every(1))
      .tickFormat(d => {
        if (d.getMonth() === 0) {
          return d3.timeFormat("%Y")(d);
        }
        return formatDateShort(d);
      })
      .tickSize(0)
      .tickPadding(12);

    // Create line generators
    const lineTension = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.tension));

    const lineRupture = d3.line()
      .x(d => xScale(d.date))
      .y(d => yScale(d.rupture));

    // Create SVG
    const svg = d3.select(chartContainer)
      .append('svg')
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Add axes
    g.append('g')
      .attr('class', 'sumchart-x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    // Style axis text
    g.selectAll('.sumchart-x-axis text')
      .filter(d => d.getMonth() === 0)
      .style('font-weight', 'bold')
      .style('fill', '#64748b');

    g.selectAll('.sumchart-x-axis text')
      .filter(d => d.getMonth() !== 0)
      .style('fill', '#64748b');

    g.selectAll('.sumchart-x-axis text')
      .style('font-size', `${labelFontSizeScale(windowWidth)}px`);

    // Draw lines - use all monthly data, not just filtered data
    g.append('path')
      .datum(monthlyData)
      .attr('class', 'sumchart-tension-line')
      .attr('d', lineTension)
      .style('fill', 'none')
      .style('stroke', 'var(--tension)')
      .style('stroke-width', '2px');

    g.append('path')
      .datum(monthlyData)
      .attr('class', 'sumchart-rupture-line')
      .attr('d', lineRupture)
      .style('fill', 'none')
      .style('stroke', 'var(--rupture)')
      .style('stroke-width', '2px');

    // Add marks (circles) for rupture data points
    const ruptureCircles = g.selectAll('.sumchart-rupture-mark')
      .data(filteredData.filter(d => d.rupture > 0 && shouldShowMarkForMonth(d.date, 12)))
      .enter()
      .append('circle')
      .attr('class', 'sumchart-rupture-mark')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.rupture))
      .attr('r', 5)
      .style('fill', 'white')
      .style('stroke', 'var(--rupture)')
      .style('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add hover effects for rupture circles
    ruptureCircles
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 8)
          .style('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 5)
          .style('stroke-width', 2);
      });

    // Add marks (circles) for tension data points
    const tensionCircles = g.selectAll('.sumchart-tension-mark')
      .data(filteredData.filter(d => d.tension > 0 && shouldShowMarkForMonth(d.date, 12)))
      .enter()
      .append('circle')
      .attr('class', 'sumchart-tension-mark')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.tension))
      .attr('r', 5)
      .style('fill', 'white')
      .style('stroke', 'var(--tension)')
      .style('stroke-width', 2)
      .style('cursor', 'pointer');

    // Add hover effects for tension circles
    tensionCircles
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 8)
          .style('stroke-width', 3);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 5)
          .style('stroke-width', 2);
      });

    // Add labels for rupture data points
    g.selectAll('.sumchart-rupture-label')
      .data(filteredData.filter(d => d.rupture > 0 && shouldShowMarkForMonth(d.date, 12)))
      .enter()
      .append('text')
      .style('font-size', `${labelFontSizeScale(windowWidth)}px`)
      .attr('class', 'sumchart-rupture-label')
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d.rupture) - 10)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--grisfonce)')
      .style('font-weight', '600')
      .text(d => d.rupture);

    // Add labels for tension data points
    g.selectAll('.sumchart-tension-label')
      .data(filteredData.filter(d => d.tension > 0 && shouldShowMarkForMonth(d.date, 12)))
      .enter()
      .append('text')
      .style('font-size', `${labelFontSizeScale(windowWidth)}px`)
      .attr('class', 'sumchart-tension-label')
      .attr('x', d => xScale(d.date))
      .attr('y', d => yScale(d.tension) - 10)
      .attr('text-anchor', 'middle')
      .style('fill', 'var(--grisfonce)')
      .style('font-weight', '600')
      .text(d => d.tension);

    // Calculate current month data
    const now = new Date();
    let currentRupture = 0;
    let currentTension = 0;

    incidents.forEach(incident => {
      const startDate = new Date(incident.start_date);
      const endDate = incident.calculated_end_date ? new Date(incident.calculated_end_date) : now;
      
      if (startDate <= now && endDate >= now) {
        const count = getSpecialiteCount(incident);
        if (incident.status === "Rupture") {
          currentRupture += count;
        } else if (incident.status === "Tension") {
          currentTension += count;
        }
      }
    });

    // Add current month indicators
    const currentMonthData = {
      date: now,
      rupture: currentRupture,
      tension: currentTension
    };

    if (currentMonthData.rupture > 0 || currentMonthData.tension > 0) {
      const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const midMonthDate = new Date(now.getFullYear(), now.getMonth(), 15);
      const labelX = xScale(midMonthDate);
      const fontSize = labelFontSizeScale(windowWidth);

      // Add rupture point if there are ruptures
      if (currentMonthData.rupture > 0) {
        g.append('circle')
          .attr('class', 'sumchart-current-point rupture-fill')
          .attr('cx', xScale(now))
          .attr('cy', yScale(currentMonthData.rupture))
          .attr('r', 3);

        const ruptureGroup = g.append('g').attr('class', 'current-label-group');
        const ruptureText = currentMonthData.rupture.toString();
        const textWidth = ruptureText.length * fontSize * 0.6;

        ruptureGroup.append('rect')
          .attr('x', labelX - textWidth/2 - 2)
          .attr('y', yScale(currentMonthData.rupture) - fontSize - 10)
          .attr('width', textWidth + 4)
          .attr('height', fontSize + 2)
          .attr('fill', 'var(--rouge)')
          .attr('rx', 2);

        ruptureGroup.append('text')
          .attr('class', 'sumchart-current-label')
          .attr('x', labelX)
          .attr('y', yScale(currentMonthData.rupture) - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--blanc)')
          .style('font-size', `${fontSize}px`)
          .style('font-weight', '700')
          .text(currentMonthData.rupture);
      }

      // Add tension point if there are tensions
      if (currentMonthData.tension > 0) {
        g.append('circle')
          .attr('class', 'sumchart-current-point tension-fill')
          .attr('cx', xScale(now))
          .attr('cy', yScale(currentMonthData.tension))
          .attr('r', 3);

        const tensionGroup = g.append('g').attr('class', 'current-label-group');
        const tensionText = currentMonthData.tension.toString();
        const textWidth = tensionText.length * fontSize * 0.6;

        tensionGroup.append('rect')
          .attr('x', labelX - textWidth/2 - 2)
          .attr('y', yScale(currentMonthData.tension) - fontSize - 10)
          .attr('width', textWidth + 4)
          .attr('height', fontSize + 2)
          .attr('fill', 'var(--jaune)')
          .attr('rx', 2);

        tensionGroup.append('text')
          .attr('class', 'sumchart-current-label')
          .attr('x', labelX)
          .attr('y', yScale(currentMonthData.tension) - 10)
          .attr('text-anchor', 'middle')
          .attr('fill', 'var(--blanc)')
          .style('font-size', `${fontSize}px`)
          .style('font-weight', '700')
          .text(currentMonthData.tension);
      }
    }
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
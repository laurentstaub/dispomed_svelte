import { writable, derived } from 'svelte/store';

// Store for raw incident data
export const incidentStore = writable([]);

// Store for filter state
export const filterStore = writable({
  searchTerm: '',
  atcClass: '',
  molecule: '',
  monthsToShow: 12,
  vaccinesOnly: false
});

// Derived store for date range based on months to show
export const dateRange = derived(
  filterStore,
  ($filterStore) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - $filterStore.monthsToShow);
    
    return { startDate, endDate };
  }
);

// Derived store for monthly chart data
export const monthlyChartData = derived(
  [incidentStore, dateRange],
  ([$incidents, $dateRange]) => {
    if (!$incidents || $incidents.length === 0) return [];
    
    const months = [];
    const current = new Date($dateRange.startDate);
    current.setDate(1);
    
    while (current <= $dateRange.endDate) {
      months.push(new Date(current));
      current.setMonth(current.getMonth() + 1);
    }
    
    return months.map(monthDate => {
      let rupture = 0;
      let tension = 0;
      
      $incidents.forEach(incident => {
        const startDate = new Date(incident.start_date);
        const endDate = new Date(incident.calculated_end_date);
        
        if (startDate <= monthDate && endDate >= monthDate) {
          const count = incident.cis_codes?.length || 1;
          
          if (incident.status === 'Rupture') {
            rupture += count;
          } else if (incident.status === 'Tension') {
            tension += count;
          }
        }
      });
      
      return {
        date: monthDate,
        rupture,
        tension
      };
    });
  }
);

// Helper function to update a single filter
export function updateFilter(key, value) {
  filterStore.update(filters => ({
    ...filters,
    [key]: value
  }));
}

// Helper function to reset all filters
export function resetFilters() {
  filterStore.set({
    searchTerm: '',
    atcClass: '',
    molecule: '',
    monthsToShow: 12,
    vaccinesOnly: false
  });
}
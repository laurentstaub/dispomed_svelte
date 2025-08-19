import { loadSqlFile, dbQuery } from '$lib/server/database.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url }) {
  // Get query parameters for initial filtering
  const monthsToShow = Number(url.searchParams.get('months')) || 12;
  const atcClass = url.searchParams.get('atc') || '';
  const searchTerm = url.searchParams.get('search') || '';
  
  try {
    // Load incidents with optimized query including CIS names
    let query = loadSqlFile('sql/incidents/get_incidents_with_cis_names.sql');
    const params = [monthsToShow];
    let additionalFilters = '';
    
    // Add server-side filters if provided
    let paramIndex = 2;
    if (atcClass) {
      additionalFilters += ` AND p.atc_code LIKE $${paramIndex} || '%'`;
      params.push(atcClass);
      paramIndex++;
    }
    
    if (searchTerm) {
      additionalFilters += ` AND (p.name ILIKE $${paramIndex} OR p.accented_name ILIKE $${paramIndex})`;
      params.push(`%${searchTerm}%`);
      paramIndex++;
    }
    
    // Replace placeholder with filters
    query = query.replace('/* ADDITIONAL_FILTERS */', additionalFilters);
    
    const { rows: incidents } = await dbQuery(query, ...params);
    
    // Get CIS names for all incidents (like the original Express app)
    const allCisCodes = [...new Set(incidents.flatMap(i => i.cis_codes || []))];
    let cisNamesMap = {};
    
    if (allCisCodes.length > 0) {
      const cisQuery = loadSqlFile('sql/products/get_cis_names.sql');
      const { rows: cisNames } = await dbQuery(cisQuery, allCisCodes);
      
      cisNames.forEach(row => {
        cisNamesMap[row.code_cis] = row.denomination_medicament;
      });
    }
    
    // Attach CIS names to incidents
    incidents.forEach(incident => {
      incident.cis_names = {};
      (incident.cis_codes || []).forEach(code => {
        incident.cis_names[code] = cisNamesMap[code] || '';
      });
    });
    
    return {
      incidents,
      filters: {
        monthsToShow,
        atcClass,
        searchTerm
      }
    };
  } catch (error) {
    console.error('Error loading incidents:', error);
    return {
      incidents: [],
      filters: {
        monthsToShow,
        atcClass,
        searchTerm
      },
      error: error.message
    };
  }
}
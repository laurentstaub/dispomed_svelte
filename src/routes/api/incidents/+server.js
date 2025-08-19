import { json } from '@sveltejs/kit';
import { loadSqlFile, dbQuery } from '$lib/server/database.js';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/** @type {import('./$types').RequestHandler} */
export async function GET({ url, setHeaders }) {
  const monthsToShow = Number(url.searchParams.get('months')) || 12;
  const atcClass = url.searchParams.get('atc') || '';
  const molecule = url.searchParams.get('molecule') || '';
  const searchTerm = url.searchParams.get('search') || '';
  const vaccinesOnly = url.searchParams.get('vaccinesOnly') === 'true';
  
  // Create cache key
  const cacheKey = JSON.stringify({ monthsToShow, atcClass, molecule, searchTerm, vaccinesOnly });
  
  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    setHeaders({
      'cache-control': 'public, max-age=300' // 5 minutes
    });
    return json(cached.data);
  }
  
  try {
    // Use the working query without JSONB complexities
    let query = loadSqlFile('sql/incidents/get_incidents_with_cis_names.sql');
    const params = [monthsToShow];
    let paramIndex = 2;
    let additionalFilters = '';
    
    // Add server-side filters
    if (atcClass) {
      additionalFilters += ` AND p.atc_code LIKE $${paramIndex} || '%'`;
      params.push(atcClass);
      paramIndex++;
    }
    
    if (vaccinesOnly) {
      additionalFilters += ` AND p.atc_code LIKE 'J07%'`;
    }
    
    if (molecule) {
      if (molecule.includes(',')) {
        const moleculeIds = molecule.split(',').map(id => id.trim());
        additionalFilters += ` AND m.id = ANY($${paramIndex}::int[])`;
        params.push(moleculeIds);
      } else {
        additionalFilters += ` AND m.id = $${paramIndex}`;
        params.push(molecule);
      }
      paramIndex++;
    }
    
    if (searchTerm) {
      additionalFilters += ` AND (p.name ILIKE $${paramIndex} OR p.accented_name ILIKE $${paramIndex} OR m.name ILIKE $${paramIndex})`;
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
    
    // Cache the results
    cache.set(cacheKey, {
      data: incidents,
      timestamp: Date.now()
    });
    
    // Clean old cache entries periodically
    if (Math.random() < 0.01) { // 1% chance
      cleanCache();
    }
    
    setHeaders({
      'cache-control': 'public, max-age=300' // 5 minutes
    });
    
    return json(incidents);
  } catch (error) {
    console.error('Error fetching incidents:', error);
    
    if (error.code === '3D000' || (error.message && error.message.includes('database') && error.message.includes('does not exist'))) {
      return json({ 
        error: 'Database Setup Required', 
        message: 'Database not properly configured. Please run npm run init-db'
      }, { status: 500 });
    }
    
    return json({ error: 'Failed to fetch incidents' }, { status: 500 });
  }
}

function cleanCache() {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      cache.delete(key);
    }
  }
}
import { json } from '@sveltejs/kit';
import { loadSqlFile, dbQuery } from '$lib/server/database.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const { productId } = params;
  
  try {
    const query = loadSqlFile('sql/incidents/get_incidents_by_product_id.sql');
    const { rows: incidents } = await dbQuery(query, productId);
    
    // Get CIS names for all incidents
    const allCisCodes = [...new Set(incidents.flatMap(incident => incident.cis_codes || []))];
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
    
    return json(incidents);
  } catch (error) {
    console.error('Error fetching product incidents:', error);
    
    if (error.code === '3D000' || (error.message && error.message.includes('database') && error.message.includes('does not exist'))) {
      return json({ 
        error: 'Database Setup Required', 
        message: 'Database not properly configured. Please run npm run init-db'
      }, { status: 500 });
    }
    
    return json({ error: 'Failed to fetch incidents' }, { status: 500 });
  }
}
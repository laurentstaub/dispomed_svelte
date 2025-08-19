import { loadSqlFile, dbQuery } from '$lib/server/database.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { cis_code } = params;
  
  try {
    // Fetch the medication name for this CIS code
    const { rows } = await dbQuery(
      loadSqlFile('sql/products/get_denomination_by_cis.sql'), 
      [cis_code]
    );
    
    const denomination = rows.length > 0 ? rows[0].denomination_medicament : cis_code;
    
    return {
      cis_code,
      denomination
    };
  } catch (error) {
    console.error('Error fetching CIS denomination for substitutions page:', error);
    
    if (error.code === '3D000' || (error.message && error.message.includes('database') && error.message.includes('does not exist'))) {
      return {
        error: 'Database Setup Required',
        message: 'Database not properly configured. Please run npm run init-db',
        cis_code,
        denomination: cis_code
      };
    }
    
    return {
      error: 'Failed to load substitutions page',
      cis_code,
      denomination: cis_code
    };
  }
}
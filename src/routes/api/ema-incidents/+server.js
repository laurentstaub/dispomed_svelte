import { json } from '@sveltejs/kit';
import { loadSqlFile, dbQuery } from '$lib/server/database.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const cis_codes = url.searchParams.get('cis_codes');
  
  if (!cis_codes) {
    return json({ error: 'cis_codes query param required' }, { status: 400 });
  }
  
  const codes = cis_codes.split(',').map(code => code.trim());
  
  try {
    const query = loadSqlFile('sql/ema/get_incidents_by_cis.sql');
    const { rows } = await dbQuery(query, codes);
    
    return json(rows);
  } catch (error) {
    console.error('Error fetching EMA incidents:', error);
    
    if (error.code === '3D000' || (error.message && error.message.includes('database') && error.message.includes('does not exist'))) {
      return json({ 
        error: 'Database Setup Required', 
        message: 'Database not properly configured. Please run npm run init-db'
      }, { status: 500 });
    }
    
    return json({ error: 'Failed to fetch EMA incidents' }, { status: 500 });
  }
}
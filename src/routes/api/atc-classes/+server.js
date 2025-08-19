import { json } from '@sveltejs/kit';
import { loadSqlFile, dbQuery } from '$lib/server/database.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const monthsToShow = Number(url.searchParams.get('months')) || 12;
  
  try {
    const query = loadSqlFile('sql/atc_classes/get_atc_classes.sql');
    const { rows } = await dbQuery(query, monthsToShow);
    
    return json(rows);
  } catch (error) {
    console.error('Error fetching ATC classes:', error);
    
    if (error.code === '3D000' || (error.message && error.message.includes('database') && error.message.includes('does not exist'))) {
      return json({ 
        error: 'Database Setup Required', 
        message: 'Database not properly configured. Please run npm run init-db'
      }, { status: 500 });
    }
    
    return json({ error: 'Failed to fetch ATC classes' }, { status: 500 });
  }
}
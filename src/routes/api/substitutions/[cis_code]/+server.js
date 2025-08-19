import { json } from '@sveltejs/kit';
import { loadSqlFile, dbQuery } from '$lib/server/database.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const { cis_code } = params;
  
  try {
    const query = `
      SELECT
        s.code_cis_origine,
        s.denomination_origine,
        s.code_cis_cible,
        s.denomination_cible,
        s.score_similarite,
        s.type_equivalence,
        s.raison
      FROM substitution.equivalences_therapeutiques s
      WHERE s.code_cis_origine::TEXT = $1 OR s.code_cis_cible::TEXT = $1
      ORDER BY s.score_similarite DESC;
    `;
    
    const { rows } = await dbQuery(query, cis_code);
    return json(rows);
  } catch (error) {
    console.error(`Error fetching substitutions for CIS ${cis_code}:`, error);
    
    if (error.code === '3D000' || (error.message && error.message.includes('database') && error.message.includes('does not exist'))) {
      return json({ 
        error: 'Database Setup Required', 
        message: 'Database not properly configured. Please run npm run init-db'
      }, { status: 500 });
    }
    
    return json({ error: 'Failed to fetch substitutions' }, { status: 500 });
  }
}
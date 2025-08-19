import { json } from '@sveltejs/kit';
import { loadSqlFile, dbQuery } from '$lib/server/database.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
  const searchTerm = url.searchParams.get('q');
  const monthsToShow = Number(url.searchParams.get('months')) || 12;
  
  if (!searchTerm || searchTerm.length < 2) {
    return json([]);
  }
  
  try {
    const searchQuery = `
      WITH max_date AS (
        SELECT MAX(calculated_end_date) AS max_date FROM incidents
      ),
      search_results AS (
        SELECT DISTINCT
          p.id AS product_id,
          p.name AS product,
          p.accented_name AS accented_product,
          MAX(i.calculated_end_date) AS latest_end_date,
          MAX(i.start_date) AS latest_start_date,
          STRING_AGG(DISTINCT i.status, ', ' ORDER BY i.status) AS statuses,
          bool_or(i.status = 'Arret' AND i.end_date IS NULL) AS is_discontinued,
          bool_or(i.calculated_end_date >= (md.max_date - INTERVAL '1 month' * $2)) AS in_current_filter
        FROM produits p
        LEFT JOIN incidents i ON p.id = i.product_id
        LEFT JOIN produits_molecules pm ON p.id = pm.produit_id
        LEFT JOIN molecules m ON pm.molecule_id = m.id
        CROSS JOIN max_date md
        WHERE (p.name ILIKE $1 OR p.accented_name ILIKE $1 OR m.name ILIKE $1)
        GROUP BY p.id, p.name, p.accented_name
      ),
      with_current_status AS (
        SELECT *,
          CASE
            WHEN is_discontinued THEN 'Arret'
            WHEN statuses LIKE '%Rupture%' AND in_current_filter THEN 'Rupture'
            WHEN statuses LIKE '%Tension%' AND in_current_filter THEN 'Tension'
            ELSE 'Disponible'
          END AS current_status
        FROM search_results
      )
      SELECT * FROM with_current_status
      ORDER BY 
        in_current_filter DESC,
        is_discontinued ASC,
        product ASC
      LIMIT 20
    `;
    
    const { rows } = await dbQuery(searchQuery, `%${searchTerm}%`, monthsToShow);
    return json(rows);
  } catch (error) {
    console.error('Error in search:', error);
    return json({ error: 'Search failed' }, { status: 500 });
  }
}
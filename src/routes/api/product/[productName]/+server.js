import { json } from '@sveltejs/kit';
import { loadSqlFile, dbQuery } from '$lib/server/database.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const { productName } = params;
  
  try {
    // 1. Find the product by name
    const productResult = await dbQuery(
      loadSqlFile('sql/products/get_product_by_name.sql'),
      productName.toLowerCase()
    );
    
    if (productResult.rows.length === 0) {
      return json({ error: 'Product not found' }, { status: 404 });
    }
    
    const product = productResult.rows[0];
    
    // 2. Get all incidents for this product (by product_id)
    const incidentsResult = await dbQuery(
      loadSqlFile('sql/incidents/get_incidents_by_product.sql'),
      product.id
    );
    
    // 3. Attach incidents to product
    product.incidents = incidentsResult.rows;
    
    return json(product);
  } catch (error) {
    console.error('Error fetching product detail:', error);
    
    if (error.code === '3D000' || (error.message && error.message.includes('database') && error.message.includes('does not exist'))) {
      return json({ 
        error: 'Database Setup Required', 
        message: 'Database not properly configured. Please run npm run init-db'
      }, { status: 500 });
    }
    
    return json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
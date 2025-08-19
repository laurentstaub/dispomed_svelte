import { loadSqlFile, dbQuery } from '$lib/server/database.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params }) {
  const { productId } = params;
  
  try {
    // Fetch the global report date (max calculated_end_date from all incidents)
    const { rows: reportRows } = await dbQuery(loadSqlFile('sql/incidents/get_max_report_date.sql'));
    const reportData = reportRows[0] || {};
    const globalReportDate = reportData.max_report_date;
    
    return {
      productId: Number(productId),
      globalReportDate
    };
  } catch (error) {
    console.error('Error loading product page:', error);
    
    if (error.message && error.message.includes('database') && error.message.includes('does not exist')) {
      return {
        error: 'Database Setup Required',
        message: 'Database not properly configured. Please run npm run init-db',
        productId: Number(productId)
      };
    }
    
    return {
      error: 'Failed to load product page',
      productId: Number(productId)
    };
  }
}
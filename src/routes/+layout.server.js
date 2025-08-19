import { loadSqlFile, dbQuery } from '$lib/server/database.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load() {
  try {
    // Get the latest report date
    const maxDateQuery = loadSqlFile('sql/incidents/get_max_report_date.sql');
    const { rows: [{ max_report_date }] } = await dbQuery(maxDateQuery);
    
    // Get ATC classes for filters (default to 12 months)
    const atcQuery = loadSqlFile('sql/atc_classes/get_atc_classes.sql');
    const { rows: atcClasses } = await dbQuery(atcQuery, 12);
    
    return {
      dateReport: max_report_date,
      atcClasses: [...new Set(atcClasses.map(atc => atc.atc_code))].map(code => ({
        code: code?.charAt(0) || '',
        name: atcClasses.find(atc => atc.atc_code === code)?.atc_description || ''
      })).filter(atc => atc.code)
    };
  } catch (error) {
    console.error('Error loading layout data:', error);
    return {
      dateReport: new Date(),
      atcClasses: []
    };
  }
}
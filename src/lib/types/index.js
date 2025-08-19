/**
 * @typedef {Object} Incident
 * @property {number} id - Incident ID
 * @property {number} product_id - Product ID
 * @property {string} product - Product name (normalized)
 * @property {string} accented_product - Product name with accents
 * @property {number[]} cis_codes - Array of CIS codes
 * @property {Object.<string, string>} cis_names - Map of CIS code to denomination
 * @property {'Rupture'|'Tension'|'Arret'|'Disponible'} status - Incident status
 * @property {string} start_date - Start date (YYYY-MM-DD)
 * @property {string} [end_date] - End date (YYYY-MM-DD)
 * @property {string} calculated_end_date - Calculated end date
 * @property {string} [molecule] - Molecule name(s)
 * @property {string} [molecule_id] - Molecule ID(s)
 * @property {string} classe_atc - ATC class with description
 * @property {string} atc_code - ATC code
 * @property {number} is_active - 1 if active, 0 if not
 * @property {number} status_priority - Priority for sorting
 * @property {number} recent_change_priority - Priority for recent changes
 * @property {string} recent_change_date - Date of recent change
 */

/**
 * @typedef {Object} ATCClass
 * @property {string} code - Single letter ATC code (A, B, C, etc.)
 * @property {string} name - ATC class description
 */

/**
 * @typedef {Object} Molecule
 * @property {number} id - Molecule ID
 * @property {string} name - Molecule name
 * @property {string} atcClass - Associated ATC class
 */

/**
 * @typedef {Object} Product
 * @property {number} id - Product ID
 * @property {string} name - Product name
 * @property {string} accented_name - Product name with accents
 * @property {number[]} cis_codes - Associated CIS codes
 * @property {string} atc_code - ATC classification code
 * @property {number} classe_atc_id - ATC class ID
 */

/**
 * @typedef {Object} FilterState
 * @property {string} searchTerm - Search query
 * @property {string} atcClass - Selected ATC class code
 * @property {string} molecule - Selected molecule ID
 * @property {number} monthsToShow - Number of months to display
 * @property {boolean} vaccinesOnly - Filter for vaccines only
 */

/**
 * @typedef {Object} MonthlyData
 * @property {Date} date - Month date
 * @property {number} rupture - Count of products in rupture
 * @property {number} tension - Count of products in tension
 */

/**
 * @typedef {Object} Substitution
 * @property {string} code_cis_origine - Origin CIS code
 * @property {string} denomination_origine - Origin product name
 * @property {string} code_cis_cible - Target CIS code
 * @property {string} denomination_cible - Target product name
 * @property {number} score_similarite - Similarity score
 * @property {string} type_equivalence - Type of equivalence
 * @property {string} raison - Reason for substitution
 */

/**
 * @typedef {Object} EMAIncident
 * @property {string} active_substance - Active substance name
 * @property {string} brand_name - Brand name
 * @property {string} shortage_start - Shortage start date
 * @property {string} shortage_end - Shortage end date
 * @property {string} shortage_status - Current status
 * @property {string} actual_expected - Actual or expected
 */

/**
 * @typedef {Object} SearchResult
 * @property {number} product_id - Product ID
 * @property {string} product - Product name
 * @property {string} accented_product - Product name with accents
 * @property {string} latest_end_date - Latest incident end date
 * @property {string} latest_start_date - Latest incident start date
 * @property {string} statuses - Comma-separated list of statuses
 * @property {boolean} is_discontinued - Whether product is discontinued
 * @property {boolean} in_current_filter - Whether in current time filter
 * @property {string} current_status - Current status
 */

// Export empty object to make this a module
export {};
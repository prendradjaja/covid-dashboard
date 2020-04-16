import qs from 'qs';
import { CovidGraphDefinition } from './types';
///////////////////////////
// URL State Deserializer
/////////////////////////
/**
 * This function specifically deserializes a stateful URL store hash into a series of graph definitions.
 *
 * To keep our URLs somewhat human-readable, I've made an assumption
 * about how location strings are structured. In most english languages,
 * double-space "  " is not a valid character. (Generally indicative of a typo)
 *
 * Many locations contain the pattern comma-space, for example:
 * Alameda, CA, USA
 *
 * However, this collides with our QS library, which expects commas to indicate
 * indices in an array.
 *
 * I've made the conscious choice to substitute "double space" ( ++ in url) for comma-space.
 * Overall, it seems to result in nicer, easier-to-read urls
 */

// QS library options
const OPTIONS = {
  // Treat comma delimiters as arrays
  comma: true,
};

// Default properties for our covid Graph Definitions
const DEFAULT_GRAPH_PROPERTIES = {
  cutoff: 10,
};

const parseQueryString = (queryString) => qs.parse(queryString, OPTIONS);
// Many locations utilize ', ' which doesn't url-encode to a nice value.
// By utilizing ++ (which don't require url encoding), we can provide
// a way to keep our graph encodings human-readable
const replaceDashWithCommaSpace = (locationArray) =>
  // Annoying quirk of QS. A single-element "Array" is a string, so we need
  // to handle the single-location case
  (Array.isArray(locationArray)
    ? locationArray
    : [locationArray]
  ).map((locString) => locString.replace(/  /g, ', '));

const generateGraphDefinitions = (userDefinedGraphProperties) => ({
  ...DEFAULT_GRAPH_PROPERTIES,
  ...userDefinedGraphProperties,
  locations: replaceDashWithCommaSpace(
    userDefinedGraphProperties.locations || []
  ),
});
export const deserialize = (hash: string): CovidGraphDefinition[] =>
  (hash || '').split('#').map(parseQueryString).map(generateGraphDefinitions);

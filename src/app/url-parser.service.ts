import { Injectable } from '@angular/core';
import qs from 'qs';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

//////////////////////////////////
// URL Graph Definition PARSER
//////////////////////////////////
/**
 * This service reads the href of the browser and parses it into
 * a programatically readable JSON object.
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

const OPTIONS = {
  // Treat comma delimiters as arrays
  comma: true,
};

const DEFAULT_GRAPH_PROPERTIES = {
  num_cases_cutoff: 10,
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

export type CovidGraphDefinition = {
  locations: string[];
  num_cases_cutoff: number;
  // Add more as needed
};

const urlToGraphs = (hash: string): CovidGraphDefinition[] =>
  hash
    .split('#')
    .map(parseQueryString)
    .map((t) => {
      console.log((t.locations || []).map(replaceDashWithCommaSpace));
      return t;
    })
    .map(generateGraphDefinitions);

@Injectable({
  providedIn: 'root',
})
export class UrlParserService {
  urlNotifier: Observable<CovidGraphDefinition[]>;
  constructor(private route: ActivatedRoute) {
    // Pass back an observable, which will update the parsed urls
    // every time a change is detected in the hash.
    this.urlNotifier = route.fragment.pipe(map(urlToGraphs));
  }
}

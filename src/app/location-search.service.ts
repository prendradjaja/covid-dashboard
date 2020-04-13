/**
 * Location Search service
 *
 * Under the hood, the "hard work" for this service is being done by an AWS Lambda function.
 * It is running through all the data in both the Corona Data Scraper website, as well
 * as the NYT website, and consolidating all unique location names into N files -- one per source.
 *
 * This service simply fetches those files in parallel, so they can be loaded into a trie
 * on the client-side for quick text-search.
 *
 * For now, this is efficient "enough", but a future optimization on this would be REDIS or Elasticsearch
 * cluster running hot with every location so user doesn't have to load these 50 kb files in memory
 *
 * Assumptions made:
 * 1. All location names are either unique, or can be coerced to a unique value (for example, by tacking on
 * -- FIPS or -- SOURCE_NAME )
 * 2. Users will want to know the source of info from a given location, (IE Iceland NYT and Iceland JHT)
 */
import { Injectable } from '@angular/core';
import { from } from 'rxjs';
import flatten from 'lodash/flatten';
import map from 'lodash/fp/map';
import * as Fuse from 'fuse.js/dist/fuse.js';

const BASE_URL = 'https://d3ujhtihw01u5c.cloudfront.net/';

const SOURCES = {
  NYT: {
    name: 'New York Times',
    url: 'https://github.com/nytimes/covid-19-data',
  },
  CDS: {
    name: 'Corona Data Scraper',
    url: 'https://coronadatascraper.com/',
  },
};
const LOCATION_SOURCES = [
  { source: SOURCES.NYT, suffix: 'search-nyt.json' },
  { source: SOURCES.CDS, suffix: 'search-cds.json' },
];
const FUSE_OPTIONS = {
  threshold: 0.6,
  keys: ['location'],
};

@Injectable({
  providedIn: 'root',
})
export class LocationSearchService {
  locations: any;
  constructor() {
    this.locations = from(
      Promise.all(
        LOCATION_SOURCES.map(({ source, suffix }) =>
          fetch(BASE_URL + suffix)
            .then((resp) => resp.json())
            .then(map((location) => ({ location, source })))
        )
      )
        .then(flatten)
        .then((locationArray) => new Fuse(locationArray, FUSE_OPTIONS))
    );
  }
}

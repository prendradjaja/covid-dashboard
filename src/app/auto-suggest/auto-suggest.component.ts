import { Component, OnInit } from '@angular/core';
import * as Fuse from 'fuse.js/dist/fuse.js';
import { CdsFetcherService, NUM_CASES_CUTOFF } from '../cds-fetcher.service';

const VISUALLY_DISTINCT_COLORS = [
  '#767833',
  '#6f68d9',
  '#7ab644',
  '#b84cb5',
  '#d0a048',
  '#57ac74',
  '#d23d72',
  '#ca8fd9',
  '#5e64a9',
  '#9b4c7d',
  '#d15133',
  '#4bbab3',
  '#67a1db',
  '#e2869f',
  '#b25d4a',
];

@Component({
  selector: 'auto-suggest',
  templateUrl: './auto-suggest.component.html',
  styleUrls: ['./auto-suggest.component.less'],
})
export class AutoSuggestComponent implements OnInit {
  searchableLocations: Fuse<string, any>;
  suggestions: Fuse.FuseResult<string>[];
  constructor(private cdsFetcherService: CdsFetcherService) {
    cdsFetcherService.data.subscribe((data) => {
      this.searchableLocations = new Fuse(Object.keys(data), {
        threshold: 0.3,
      });
    });
  }

  locationSearch = (event) => {
    if (this.searchableLocations)
      this.suggestions = this.searchableLocations
        .search(event.target.value)
        .slice(0, 10);
  };

  addLocation = (location) => {
    console.log(location);
    let t = location.replace(/, /g, '++').replace(/ /g, '+');
    window.location.hash = window.location.hash.replace(',&', `,${t},&`);
    this.suggestions = [];
  };
  ngOnInit(): void {}
}

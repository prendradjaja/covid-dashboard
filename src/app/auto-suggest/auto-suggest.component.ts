import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as Fuse from 'fuse.js/dist/fuse.js';
import { CovidGraphDefinition } from 'src/lib/URLState';
import { LocationSearchService } from '../location-search.service';

@Component({
  selector: 'auto-suggest',
  templateUrl: './auto-suggest.component.html',
  styleUrls: ['./auto-suggest.component.less'],
})
export class AutoSuggestComponent implements OnInit {
  searchableLocations: Fuse<string, any>;
  suggestions: Fuse.FuseResult<string>[];

  // @Input() index?: number;
  // @Input() graphDefinitions: CovidGraphDefinition[];

  @Output() addLocation = new EventEmitter<string>();
  @Output() clearAll = new EventEmitter<void>();

  updateGraph: (a: number, b: CovidGraphDefinition) => void;
  constructor(private locationSearchService: LocationSearchService) {
    locationSearchService.locations.subscribe((locations) => {
      this.searchableLocations = locations;
    });
    window.addEventListener('click', () => {
      this.suggestions = [];
    });
  }

  locationSearch = (event) => {
    if (this.searchableLocations)
      this.suggestions = this.searchableLocations
        .search(event.target.value)
        .slice(0, 10);
  };

  handleAddLocation = ({ location }) => {
    this.addLocation.next(location);
    // this.graphDefinitions[this.index].locations.push(location);
    // URLState.serialize(this.graphDefinitions);
  };

  handleClearAll = () => {
    this.clearAll.next();
    // this.graphDefinitions[this.index].locations = [];
    // URLState.serialize(this.graphDefinitions);
  };

  ngOnInit(): void {}
}

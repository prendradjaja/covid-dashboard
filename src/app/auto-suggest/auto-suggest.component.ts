import { Component, OnInit, Input } from '@angular/core';
import * as Fuse from 'fuse.js/dist/fuse.js';
import { CovidGraphDefinition } from 'src/lib/URLState';
import { LocationSearchService } from '../location-search.service';
import URLState from '../../lib/URLState';
import { ColorService } from '../color.service';

@Component({
  selector: 'auto-suggest',
  templateUrl: './auto-suggest.component.html',
  styleUrls: ['./auto-suggest.component.less'],
})
export class AutoSuggestComponent implements OnInit {
  searchableLocations: Fuse<string, any>;
  suggestions: Fuse.FuseResult<string>[];

  @Input() index?: number;
  @Input() graphDefinitions: CovidGraphDefinition[];

  updateGraph: (a: number, b: CovidGraphDefinition) => void;
  constructor(
    public colorService: ColorService,
    private locationSearchService: LocationSearchService
  ) {
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

  addLocation = ({ location }) => {
    this.graphDefinitions[this.index].locations.push(location);
    URLState.serialize(this.graphDefinitions);
  };

  clearAll = () => {
    this.graphDefinitions[this.index].locations = [];
    URLState.serialize(this.graphDefinitions);
  };

  ngOnInit(): void {}
}

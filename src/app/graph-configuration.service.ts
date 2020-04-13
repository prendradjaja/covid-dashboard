import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import URLState, { CovidGraphDefinition } from '../lib/URLState';

@Injectable({
  providedIn: 'root',
})
export class GraphConfigurationService {
  graphDefinitions: Observable<CovidGraphDefinition[]>;
  updateGraph: (index: number, definition: CovidGraphDefinition) => void;
  clearGraph: () => void;
  constructor(private route: ActivatedRoute) {
    // Pass back an observable, which will update the parsed urls
    // every time a change is detected in the hash.
    this.graphDefinitions = route.fragment.pipe(map(URLState.deserialize));
    this.updateGraph = URLState.edit;
    this.clearGraph = URLState.clear;
  }
}

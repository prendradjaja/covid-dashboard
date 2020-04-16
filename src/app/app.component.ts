import { Component } from '@angular/core';
import { Series } from './multi-line-chart/multi-line-chart.component';
import { GraphDataService } from './graph-data.service';
import { GraphConfigurationService } from './graph-configuration.service';
import { CovidGraphDefinition } from 'src/lib/URLState';
import { combineLatest } from 'rxjs';
import zipWith from 'lodash/zipWith';

interface Graph {
  data: Series[];
  definition: CovidGraphDefinition;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'angular9covid-dashboard';
  graphs: Graph[];
  allGraphDefinitions: CovidGraphDefinition[]; // TODO refactor AutoSuggestComponent so that we can delete this and just depend on .graphs
  constructor(
    private graphDataService: GraphDataService,
    private graphConfigurationService: GraphConfigurationService
  ) {
    combineLatest([
      graphDataService.graphData,
      graphConfigurationService.graphDefinitions,
    ]).subscribe(([graphData, graphDefinitions]) => {
      this.graphs = zipWith(
        graphData,
        graphDefinitions,
        (data, definition) => ({ data, definition })
      );
      this.allGraphDefinitions = graphDefinitions;
    });
  }
}

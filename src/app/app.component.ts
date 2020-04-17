import { Component } from '@angular/core';
import { Series } from './multi-line-chart/multi-line-chart.component';
import { GraphDataService } from './graph-data.service';
import { GraphConfigurationService } from './graph-configuration.service';
import { CovidGraphDefinition } from 'src/lib/URLState';
import { combineLatest } from 'rxjs';
import zipWith from 'lodash/zipWith';
import URLState from '../lib/URLState';

// if you're getting an error bc this doesn't exist, run git-version.sh
import { version } from '../environments/version';
import { ActivatedRoute } from '@angular/router';

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

  isEditing = false;
  editingIndex: number;

  version: typeof version;

  constructor(
    public route: ActivatedRoute,
    private graphDataService: GraphDataService,
    private graphConfigurationService: GraphConfigurationService
  ) {
    // TODO should all this be in ngOnInit?
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
    this.version = version;
  }

  startEditing(index: number) {
    this.isEditing = true;
    this.editingIndex = index;
  }

  stopEditing(): void {
    this.isEditing = false;
  }

  setXMin(value: number): void {
    this.updateProperty('x_axis_bounds', [value, 100])
  }

  private updateProperty(key: string, value: any): void {
    this.graphs[this.editingIndex].definition[key] = value;
    URLState.serialize(this.graphDefinitions);
  }

  private get graphDefinitions(): CovidGraphDefinition[] {
    return this.graphs.map(graph => graph.definition)
  }
}

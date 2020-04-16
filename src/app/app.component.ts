import { Component } from '@angular/core';
import { Series } from './multi-line-chart/multi-line-chart.component';
import { GraphDataService } from './graph-data.service';
import { GraphConfigurationService } from './graph-configuration.service';
import { CovidGraphDefinition } from 'src/lib/URLState';
import { combineLatest } from 'rxjs';
import zipWith from 'lodash/zipWith';
import URLState from '../lib/URLState';

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

  isEditing = false;
  editingIndex: number = 0;

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
    });
  }

  startEditing(index: number) {
    this.isEditing = true;
    this.editingIndex = index;
  }

  stopEditing(): void {
    this.isEditing = false;
  }

  handleAddLocation(location)  {
    this.graphs[this.editingIndex].definition.locations.push(location);
    URLState.serialize(this.graphDefinitions);
  }

  handleClearAll() {
    this.graphDefinitions[this.editingIndex].locations = [];
    URLState.serialize(this.graphDefinitions);
  };

  private get graphDefinitions(): CovidGraphDefinition[] {
    return this.graphs.map(graph => graph.definition);
  }
}

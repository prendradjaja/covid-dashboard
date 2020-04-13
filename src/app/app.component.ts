import { Component } from '@angular/core';
import { Series } from './multi-line-chart/multi-line-chart.component';
import { GraphDataService } from './graph-data.service';
import { GraphConfigurationService } from './graph-configuration.service';
import { CovidGraphDefinition } from 'src/lib/URLState';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'angular9covid-dashboard';
  graphData: Series[][];
  graphDefinitions: CovidGraphDefinition[];
  constructor(
    private graphDataService: GraphDataService,
    private graphConfigurationService: GraphConfigurationService
  ) {
    graphDataService.graphData.subscribe((graphData) => {
      this.graphData = graphData;
    });

    graphConfigurationService.graphDefinitions.subscribe(
      (graphDefinitions) => (this.graphDefinitions = graphDefinitions)
    );
  }
}

import { Component } from '@angular/core';
import { json } from 'd3';
import {
  CdsFetcherService,
  Foo,
  NUM_CASES_CUTOFF,
} from './cds-fetcher.service';
import { Series } from './multi-line-chart/multi-line-chart.component';
import { UrlParserService, CovidGraphDefinition } from './url-parser.service';

const MY_LOCATIONS = ['Alameda County, CA, USA', 'USA', 'ITA', 'JPN'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'angular9covid-dashboard';
  cdsData: { [key: string]: Foo };
  graphs: Series[][];
  numCasesCutoff = NUM_CASES_CUTOFF;
  constructor(
    private cdsFetcherService: CdsFetcherService,
    private urlParserService: UrlParserService
  ) {
    cdsFetcherService.data.then(data => {
      this.cdsData = data;
      this.graphs = [];
      for (let definition of urlParserService.graphDefinitions) {
        let graphData = [];
        for (let location of definition.locations) {
          // Sometimes people make typos -- don't bail, return what you can.
          if (!data[location]) {
            console.warn(`Location not found: ${location}`);
            continue;
          }
          graphData.push({
            name: location,
            values: data[location].map(item => item.cases),
            comments: data[location].map(item => item.date.toDateString()),
          });
        }
        (graphData as any).params = definition; // TODO do this properly
        this.graphs.push(graphData);
      }
      console.log(this.graphs);
    });
  }
}

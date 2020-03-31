import { Component } from '@angular/core';
import { json } from 'd3';
import {
  CdsFetcherService,
  Foo,
  NUM_CASES_CUTOFF,
} from './cds-fetcher.service';
import { Series } from './multi-line-chart/multi-line-chart.component';

const MY_LOCATIONS = ['Alameda County, CA, USA', 'USA', 'ITA', 'JPN'];

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'angular9covid-dashboard';
  cdsData: { [key: string]: Foo };
  exampleData = [
    {
      name: 'Alameda County',
      values: [1, 10, 100, 1000, 1000],
    },
    {
      name: 'Sonoma County',
      values: [2, 20, 200, 2000, 20000],
    },
  ];
  actualData: Series[];
  numCasesCutoff = NUM_CASES_CUTOFF;
  constructor(private cdsFetcherService: CdsFetcherService) {
    cdsFetcherService.data.then(data => {
      this.cdsData = data;
      this.actualData = [];
      for (let location of MY_LOCATIONS) {
        this.actualData.push({
          name: location,
          values: data[location].map(item => item.cases),
          comments: data[location].map(item => item.date.toDateString()),
        });
      }
    });
  }
}

import { Component } from '@angular/core';
import { CdsFetcherService, NUM_CASES_CUTOFF } from './cds-fetcher.service';
import { Series } from './multi-line-chart/multi-line-chart.component';
import { UrlParserService } from './url-parser.service';
import { combineLatest } from 'rxjs';
import { NytFetcherService } from './nyt-fetcher.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'angular9covid-dashboard';
  graphs: Series[][];
  numCasesCutoff = NUM_CASES_CUTOFF;
  constructor(
    private cdsFetcherService: CdsFetcherService,
    private urlParserService: UrlParserService,
    private nytFetcherService: NytFetcherService
  ) {
    combineLatest(
      cdsFetcherService.data,
      nytFetcherService.data,
      urlParserService.urlNotifier
    ).subscribe(([cdsData, nytData, graphDefinitions]) => {
      if (cdsData) {
        this.graphs = {
          ...this.graphs,
          ...graphDefinitions.map((definition) =>
            definition.locations
              // allow invalid names
              .filter((name) => cdsData[name])
              .map((name) => ({
                name,
                values: cdsData[name].map((item) => item.cases),
                comments: cdsData[name].map((item) => item.date.toDateString()),
              }))
          ),
        };
      }

      if (nytData) {
        this.graphs = {
          ...this.graphs,
          ...graphDefinitions.map((definition) =>
            definition.locations
              // allow invalid names
              .filter((name) => nytData[name])
              .map((name) => ({
                name,
                values: nytData[name].map((item) => item.cases),
                comments: nytData[name].map((item) => item.date.toDateString()),
              }))
          ),
        };
      }
    });
  }
}

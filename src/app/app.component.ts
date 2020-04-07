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
      const data = {
        ...cdsData,
        ...nytData,
      };

      if (Object.keys(data).length === 0) return;
      this.graphs = graphDefinitions.map((definition) =>
        definition.locations
          // allow invalid names
          .filter((name) => data[name])
          .map((name) => ({
            name,
            values: data[name].map((item) => item.cases),
            comments: data[name].map((item) => item.date.toDateString()),
          }))
      );
    });
  }
}

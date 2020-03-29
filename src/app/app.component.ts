import { Component } from '@angular/core';
import { json } from 'd3';
import { CdsFetcherService } from './cds-fetcher.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'angular9covid-dashboard';
  cdsData: Promise<any>;
  constructor(private cdsFetcherService: CdsFetcherService) {
    this.cdsData = cdsFetcherService.data;
  }
}

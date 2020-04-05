import { Injectable } from '@angular/core';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import parse from 'date-fns/parse';
import mapValues from 'lodash/fp/mapValues';
import { Observable } from 'rxjs';

type CDSCount = {
  active: number;
  cases: number;
  deaths: number;
  recovered: number;
  growthFactor: number;
};

export type CDSLocationTimeSeriesData = {
  aggregate: string;
  coordinates: number[];
  dates: {
    [s: string]: CDSCount;
  };
};

export type Foo = {
  // TODO name
  date: Date;
  daysSinceOutbreak: number;
  active: number;
  cases: number;
  deaths: number;
  recovered: number;
  growthFactor: number;
}[];

export const NUM_CASES_CUTOFF = 10;
// Data source 1: Open source Corona Data Scraper site (less reliable than NYT and JH, but more locations.)
const CORONA_URL = `https://coronadatascraper.com/timeseries-byLocation.json`;

const parseCDSDateString = (dateString) =>
  parse(dateString, 'yyyy-MM-dd', new Date(1984, 0, 1));

function parseTimeseriesData(tsData: CDSLocationTimeSeriesData): Foo {
  let dates = Object.entries(tsData.dates);
  let outbreakStartIndex = dates.findIndex(
    ([_, info]) => info.cases > NUM_CASES_CUTOFF
  );
  if (outbreakStartIndex < 0) return [];
  let outBreakStartDate = parseCDSDateString(dates[outbreakStartIndex][0]);
  const formattedDatesSinceOutbreak = dates
    .slice(outbreakStartIndex)
    .map(([dateString, info]) => {
      let date = parseCDSDateString(dateString);
      return {
        ...info,
        date,
        daysSinceOutbreak: differenceInCalendarDays(date, outBreakStartDate),
      };
    });
  return formattedDatesSinceOutbreak;
}

@Injectable({
  providedIn: 'root',
})
export class CdsFetcherService {
  data: Observable<{ [key: string]: Foo }>;

  constructor() {
    this.data = new Observable((observer) => {
      fetch(CORONA_URL)
        // get response data to json
        .then((res) => res.json())
        // convert json to correctly formatted timeseries
        .then(mapValues(parseTimeseriesData))
        // emit the processed data.
        .then((data) => observer.next(data));
    });
  }
}

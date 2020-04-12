import { Injectable } from '@angular/core';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import parse from 'date-fns/parse';
import mapValues from 'lodash/fp/mapValues';

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

export const NUM_CASES_CUTOFF = 1;

const parseCDSDateString = (dateString) =>
  parse(dateString, 'yyyy-MM-dd', new Date(1984, 0, 1));

function parseTimeseriesData(tsData: CDSLocationTimeSeriesData): Foo {
  let dates = Object.entries(tsData.dates);
  let outbreakStartIndex = dates.findIndex(([dateString, info]) => {
    return info.deaths > NUM_CASES_CUTOFF;
  });
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
  data: Promise<{ [key: string]: Foo }>;

  constructor() {
    const CORONA_URL = `https://coronadatascraper.com/timeseries-byLocation.json`;
    let timeInit;
    this.data = fetch(CORONA_URL)
      .then((response) => {
        timeInit = performance.now();

        return response.json();
      })
      .then(mapValues(parseTimeseriesData));
  }
}

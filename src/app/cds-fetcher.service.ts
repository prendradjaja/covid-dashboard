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

const parseCDSDateString = dateString =>
  parse(dateString, 'yyyy-MM-dd', new Date(1984, 0, 1));

const parseTimeseriesData = (tsData: CDSLocationTimeSeriesData) => {
  let dates = Object.entries(tsData.dates);
  let outbreakStartIndex = dates.findIndex(([dateString, info]) => {
    return info.cases > 10;
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
};

@Injectable({
  providedIn: 'root',
})
export class CdsFetcherService {
  data: Promise<any>;

  constructor() {
    const CORONA_URL = `https://coronadatascraper.com/timeseries-byLocation.json`;
    let timeInit;
    this.data = fetch(CORONA_URL)
      .then(response => {
        timeInit = performance.now();

        return response.json();
      })
      .then(mapValues(parseTimeseriesData));
  }
}

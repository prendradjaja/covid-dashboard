import { Injectable } from '@angular/core';
import groupBy from 'lodash/groupBy';
import * as CSV from '../lib/CSV';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import parse from 'date-fns/parse';
import mapValues from 'lodash/mapValues';
import { Foo } from './cds-fetcher.service';
import { from, Observable } from 'rxjs';

const NYT_URL = `https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-states.csv`;

const parseCDSDateString = (dateString) =>
  parse(dateString, 'yyyy-MM-dd', new Date(1984, 0, 1));

type NYTTimeSeriesDataPoint = {
  location: string;
  date: Date;
  cases: number;
  deaths: number;
};
type NYTTimeseriesData = {
  [s: string]: NYTTimeSeriesDataPoint[];
};

function parseTimeseriesData(dates: NYTTimeSeriesDataPoint[]): Foo {
  let outbreakStartIndex = dates.findIndex((info: any) => info.cases > 10);
  if (outbreakStartIndex < 0) return [];
  let outBreakStartDate = parseCDSDateString(dates[outbreakStartIndex].date);
  const formattedDatesSinceOutbreak = dates
    .slice(outbreakStartIndex)
    .map((info: any) => {
      let date = parseCDSDateString(info.date);
      return {
        ...info,
        date,
        daysSinceOutbreak: differenceInCalendarDays(date, outBreakStartDate),
      };
    });
  return formattedDatesSinceOutbreak;
}
const convertNYTArrayToCoronaDatapoint = ([
  date,
  locationName,
  fips,
  cases,
  deaths,
]) => ({
  location: `${locationName} ${fips} NYT`,
  date,
  cases,
  deaths,
});

@Injectable({
  providedIn: 'root',
})
export class NytFetcherService {
  data: Observable<{ [s: string]: Foo }>;
  constructor() {
    this.data = from(
      CSV.fetch({
        url: NYT_URL,
      }).then((data) => {
        let records = data.records.map(convertNYTArrayToCoronaDatapoint);
        let groupedData: NYTTimeseriesData = groupBy(records, 'location');
        let withFormattedDays: { [s: string]: Foo } = mapValues(
          groupedData,
          parseTimeseriesData
        );
        return withFormattedDays;
      }) as Promise<{ [s: string]: Foo }>
    );
  }
}

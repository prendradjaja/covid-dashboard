/**
 * Consolidated Data Service
 *
 * Thanks to an AWS Lambda function running against cloudfront distribution:
 * https://d3ujhtihw01u5c.cloudfront.net
 *
 * We now have a single, uniform store for time-series data coming from various Corona Data sources.
 * The strict types for these are found here.
 *
 * With this, we no longer need to have "bad manners" by hammering the TimeSeries github data,
 * and also can take advantage of the slick caching provided by Cloudfront to ensure customers
 * get their data quickly (graphs should load withou much lower latency now)
 *
 * Assumptions made:
 * 1. Data will be updated at a daily cadence (more granularity isn't necessary)
 * 2. New datasources onboarded will either be compatible, or can be coerced into the TimeSeriesDatapoint format
 *
 */
import { Injectable } from '@angular/core';
import { GraphConfigurationService } from './graph-configuration.service';
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import parse from 'date-fns/parse';
import { Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { CovidGraphDefinition } from 'src/lib/URLState';
import { Series } from './multi-line-chart/multi-line-chart.component';

const BASE_URL = 'https://d3ujhtihw01u5c.cloudfront.net/locations/';

// The shape of the data coming down from Cloudfront
type LocationTimeseriesData = {
  dates: TimeSeriesDataPoint[];
  source: string;
};

type TimeSeriesDataPoint = Partial<{
  date: Date;
  cases: number;
  deaths: number;
  active: number;
  recovered: number;
  hospitalized: number;
  growthFactor: number;
  daysSinceCutoff: number;
}>;

const parseDateString = (dateString) =>
  parse(dateString, 'yyyy-MM-dd', new Date(1984, 0, 1));

function parseTimeseriesData(
  response: LocationTimeseriesData,
  field,
  cutoff
): TimeSeriesDataPoint[] {
  const dates = response.dates;
  let outbreakStartIndex = dates.findIndex(
    (info) => parseInt(info[field], 10) > cutoff
  );
  if (outbreakStartIndex < 0) return [];
  let outBreakStartDate = parseDateString(dates[outbreakStartIndex].date);
  return dates.slice(outbreakStartIndex).map((info) => {
    let date = parseDateString(info.date);
    return {
      ...info,
      date,
      daysSinceCutoff: differenceInCalendarDays(date, outBreakStartDate),
    };
  });
}

const fetchGraphData = (graphDefinitions: CovidGraphDefinition[]) =>
  // For every graph we define
  Promise.all(
    graphDefinitions.map(
      async ({ cutoff = 10, locations = [], data_type = 'cases' }) =>
        // For every location in the graph
        (
          await Promise.all(
            locations.map(async (location) => {
              try {
                let locationData = await fetch(
                  BASE_URL + location.replace(/  /g, ', ') + '.json'
                )
                  .then((response) => response.json())
                  .then((data: LocationTimeseriesData) =>
                    parseTimeseriesData(data, data_type, cutoff)
                  );
                return {
                  name: location.split(',')[0],
                  values: locationData.map((l) => parseInt(l[data_type], 10)),
                  comments: locationData.map((l) => l.date.toISOString()),
                };
              } catch (e) {
                console.error(`Location ${location} is invalid`);
                // Gracefully handle when a location was not found
                return null;
              }
            })
          )
        )
          // Gracefully handle when a location was not found (handle null case)
          .filter((f) => f)
    )
  );

@Injectable({
  providedIn: 'root',
})
export class GraphDataService {
  graphData: Observable<Series[][]>;
  constructor(private graphConfigurationService: GraphConfigurationService) {
    this.graphData = graphConfigurationService.graphDefinitions.pipe(
      // Using mergemap to support async promise resolution in observables
      mergeMap(fetchGraphData)
    );
  }
}

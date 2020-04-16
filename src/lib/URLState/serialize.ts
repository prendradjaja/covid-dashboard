import qs from 'qs';
import { CovidGraphDefinition } from './types';

const OPTIONS = {
  indices: false,
};

const replaceCommaSpaceWithDoubleSpace = (locationArray) =>
  locationArray.map((l) => l.replace(/, /g, '++'));

export const serialize = (definitions: CovidGraphDefinition[]) => {
  window.location.hash = definitions.length
    ? '#' +
      definitions
        .map((d) =>
          qs.stringify(
            {
              ...d,
              locations: replaceCommaSpaceWithDoubleSpace(d.locations),
            },
            OPTIONS
          )
        )
        .join('#')
    : '';
};

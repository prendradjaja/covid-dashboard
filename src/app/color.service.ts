import { Injectable } from '@angular/core';

const VISUALLY_DISTINCT_COLORS = [
  '#767833',
  '#6f68d9',
  '#7ab644',
  '#b84cb5',
  '#d0a048',
  '#57ac74',
  '#d23d72',
  '#ca8fd9',
  '#5e64a9',
  '#9b4c7d',
  '#d15133',
  '#4bbab3',
  '#67a1db',
  '#e2869f',
  '#b25d4a',
];

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  constructor() {}

  public getColor(s: string): string {
    const hash = this.hash(s);
    const numColors = VISUALLY_DISTINCT_COLORS.length;
    return VISUALLY_DISTINCT_COLORS[Math.abs(hash) % numColors];
  }

  // Lifted from https://stackoverflow.com/a/7616484/1945088
  private hash(s: string): number {
    var hash = 0,
      i,
      chr;
    for (i = 0; i < s.length; i++) {
      chr = s.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }
}

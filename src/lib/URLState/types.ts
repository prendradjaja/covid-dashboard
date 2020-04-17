export enum AxisScale {
  linear = 'linear',
  log = 'log',
}

export type CovidGraphDefinition = {
  title?: string;
  locations: string[];
  cutoff: number;
  data_type: string;
  x_axis_bounds: number[];
  y_axis_bounds: number[];
  y_axis_scale: AxisScale;
  animate: boolean; // Bug: if animate=false, it's treated as true. Must omit in order to use false
  // Add more as needed
};

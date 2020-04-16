export type CovidGraphDefinition = {
  locations: string[];
  cutoff: number;
  data_type: string;
  x_axis_bounds: number[];
  y_axis_bounds: number[];
  animate: boolean; // Bug: if animate=false, it's treated as true. Must omit in order to use false
  // Add more as needed
};

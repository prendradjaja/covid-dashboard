export type CovidGraphDefinition = {
  locations: string[];
  cutoff: number;
  data_type: string;
  x_axis_bounds: number[];
  y_axis_bounds: number[];
  animate: boolean;
  // Add more as needed
};
